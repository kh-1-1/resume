const { execFile } = require("child_process")
const fs = require("fs/promises")
const http = require("http")
const path = require("path")
const { spawn } = require("child_process")
const { promisify } = require("util")
const { chromium } = require("playwright")

const execFileAsync = promisify(execFile)
const appUrl = "http://127.0.0.1:5173/"

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function isReachable(url) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume()
      resolve(response.statusCode >= 200 && response.statusCode < 500)
    })

    request.setTimeout(1000, () => {
      request.destroy()
      resolve(false)
    })
    request.on("error", () => resolve(false))
  })
}

async function waitForServer(url, timeoutMs = 15000) {
  const started = Date.now()

  while (Date.now() - started < timeoutMs) {
    if (await isReachable(url)) {
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  throw new Error(`Timed out waiting for ${url}`)
}

async function startServerIfNeeded() {
  if (await isReachable(appUrl)) {
    return null
  }

  const server = spawn(
    process.execPath,
    [path.resolve("node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", "5173"],
    {
      env: { ...process.env, BROWSER: "none" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  )

  await waitForServer(appUrl)
  return server
}

function browserExecutablePath() {
  const candidates = [
    process.env.PLAYWRIGHT_BROWSER_PATH,
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  ].filter(Boolean)

  return candidates.find((candidate) => require("fs").existsSync(candidate))
}

async function resetStorage(page) {
  await page.evaluate(async () => {
    localStorage.clear()
    sessionStorage.clear()
    await new Promise((resolve) => {
      const request = indexedDB.deleteDatabase("resume_maker_db")

      request.onsuccess = request.onerror = request.onblocked = () => resolve()
    })
  })
}

async function readStoredResume(page, resumeId) {
  return page.evaluate(
    (id) =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("resume_maker_db")

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const database = request.result
          const transaction = database.transaction("resumes", "readonly")
          const getRequest = transaction.objectStore("resumes").get(id)

          getRequest.onerror = () => reject(getRequest.error)
          getRequest.onsuccess = () => resolve(getRequest.result)
          transaction.oncomplete = () => database.close()
        }
      }),
    resumeId,
  )
}

async function waitForStoredResume(page, resumeId, predicate, timeoutMs = 6000) {
  const started = Date.now()
  let lastResume

  while (Date.now() - started < timeoutMs) {
    const resume = await readStoredResume(page, resumeId)
    lastResume = resume

    if (resume && predicate(resume)) {
      return resume
    }

    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  throw new Error(`Timed out waiting for resume ${resumeId} to persist. Last value: ${JSON.stringify(lastResume)}`)
}

async function pdfPageCount(filePath) {
  try {
    const { stdout } = await execFileAsync("pdfinfo.exe", [filePath])
    const match = stdout.match(/^Pages:\s+(\d+)/m)

    return match ? Number(match[1]) : undefined
  } catch {
    return undefined
  }
}

async function activeElementText(page) {
  return page.evaluate(() => document.activeElement?.textContent?.trim() || "")
}

async function main() {
  const outputDir = path.resolve("output/playwright")
  await fs.mkdir(outputDir, { recursive: true })

  const server = await startServerIfNeeded()
  const executablePath = browserExecutablePath()

  if (!executablePath) {
    throw new Error("No Edge/Chrome executable found. Set PLAYWRIGHT_BROWSER_PATH to run browser verification.")
  }

  const browser = await chromium.launch({ executablePath, headless: true })
  const page = await browser.newPage({ acceptDownloads: true, viewport: { width: 1440, height: 1000 } })
  const browserErrors = []

  await page.route("**/private-resume-import.json", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        app: "resume-maker",
        version: 1,
        exportedAt: "2026-01-01T00:00:00.000Z",
        resumes: [],
      }),
    }),
  )

  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text())
    }
  })
  page.on("pageerror", (error) => browserErrors.push(error.message))

  try {
    await page.goto(appUrl, { waitUntil: "networkidle" })
    await resetStorage(page)
    await page.reload({ waitUntil: "networkidle" })

    const sampleCard = page.locator("[data-resume-id]").filter({ hasText: "我的默认简历" })
    await sampleCard.waitFor({ timeout: 15000 })
    assert((await page.locator("[data-resume-id]").count()) === 1, "A clean browser should seed one generic resume.")

    await page.goto(`${appUrl}/#/resume/interaction-missing-id`, { waitUntil: "networkidle" })
    await page.getByText("没有找到这份简历", { exact: true }).waitFor()
    await page.getByRole("button", { name: "返回列表" }).click()
    await sampleCard.waitFor()
    assert((await page.locator("[data-resume-id]").count()) === 1, "Opening a missing resume id created a blank record.")

    const dashboardMenuButton = page.getByRole("button", { name: "更多操作" }).first()
    await dashboardMenuButton.click()
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "创建示例简历")
    assert((await activeElementText(page)) === "创建示例简历", "Dashboard menu did not focus its first item.")
    await page.keyboard.press("End")
    const lastDashboardMenuItem = page.getByRole("menuitem").last()
    assert(
      await lastDashboardMenuItem.evaluate((element) => element === document.activeElement),
      "Dashboard menu End navigation failed.",
    )
    await page.keyboard.press("Escape")
    assert(await dashboardMenuButton.evaluate((element) => element === document.activeElement), "Menu Escape did not restore trigger focus.")

    const cardMenuButton = sampleCard.getByRole("button", { name: "更多操作" })
    await cardMenuButton.click()
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "导出 JSON")
    assert((await activeElementText(page)) === "导出 JSON", "Resume card menu did not focus its first item.")
    await page.mouse.click(20, 500)
    assert((await sampleCard.getByRole("menu").count()) === 0, "Clicking outside did not close the card menu.")

    const dashboardShot = path.join(outputDir, "dashboard-interactions.png")
    await page.screenshot({ path: dashboardShot, fullPage: true })

    await sampleCard.getByRole("button", { name: /编辑简历/ }).click()
    await page.locator("[data-editor-panel]").waitFor()
    const resumeId = decodeURIComponent(page.url().split("/resume/")[1])
    assert(Boolean(resumeId), "Editor route did not expose a resume id.")

    const panelScrollState = await page.evaluate(() => {
      const editor = document.querySelector("[data-editor-panel]")
      const preview = document.querySelector("[data-preview-pane]")

      return {
        editor: editor ? getComputedStyle(editor).overflowY : "missing",
        preview: preview ? getComputedStyle(preview).overflowY : "missing",
      }
    })
    assert(panelScrollState.editor === "auto" && panelScrollState.preview === "auto", `Editor panes are not independently scrollable: ${JSON.stringify(panelScrollState)}`)

    const titleInput = page.getByLabel("简历标题")
    const nameInput = page.getByLabel("姓名", { exact: true })
    const jobTitleInput = page.getByLabel("目标岗位", { exact: true })
    await titleInput.fill("交互回归简历")
    await nameInput.fill("测试用户")
    await nameInput.press("Enter")
    assert(await jobTitleInput.evaluate((element) => element === document.activeElement), "Enter did not advance to the next input.")

    const photoImport = page.getByRole("button", { name: "导入照片" })
    const [photoChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      photoImport.press("Enter"),
    ])
    await photoChooser.setFiles([])

    await page.getByRole("button", { name: "预览", exact: true }).click()
    const directName = page.locator('.resume-screen-pages [data-edit-path="basics.name"]').first()
    await directName.click()
    await directName.press("End")
    await page.keyboard.type("-直编")
    await directName.press("Enter")
    await page.waitForFunction(() => document.querySelector('[data-edit-path="basics.name"]')?.textContent?.includes("测试用户-直编"))

    const sectionTitle = page.locator('.resume-screen-pages [data-edit-path="sectionTitles.education"]').first()
    await sectionTitle.click()
    await sectionTitle.press("Control+A")
    await page.keyboard.type("学习经历")
    await sectionTitle.press("Enter")
    await page.waitForFunction(() => document.querySelector('[data-edit-path="sectionTitles.education"]')?.textContent?.includes("学习经历"))

    const positionTitle = page.locator('.resume-screen-pages [data-edit-path="experience.0.position"]').first()
    await positionTitle.click()
    await positionTitle.press("Control+A")
    await page.keyboard.type("高级测试职位")
    await positionTitle.press("Enter")
    await page.waitForFunction(() => document.querySelector('[data-edit-path="experience.0.position"]')?.textContent?.includes("高级测试职位"))

    let highlight = page.locator('.resume-screen-pages [data-edit-path="experience.0.highlights.0"]').first()
    const originalHighlight = (await highlight.textContent()) || "负责核心业务模块的设计与开发"
    await highlight.click()
    await highlight.press("End")
    await highlight.press("Enter")
    await page.keyboard.type("预览换行测试")
    await highlight.press("Control+Enter")
    await waitForStoredResume(page, resumeId, (resume) => resume.experience[0].highlights[0].includes("\n预览换行测试"))

    highlight = page.locator('.resume-screen-pages [data-edit-path="experience.0.highlights.0"]').first()
    await highlight.click()
    await highlight.evaluate((element) => {
      const range = document.createRange()
      const selection = window.getSelection()

      range.selectNodeContents(element)
      selection.removeAllRanges()
      selection.addRange(range)
    })
    await page.keyboard.press("Control+B")
    await highlight.press("Control+Enter")
    await waitForStoredResume(page, resumeId, (resume) => resume.experience[0].highlights[0].startsWith("**"))

    const stableName = (await directName.textContent()) || "测试用户-直编"
    await directName.click()
    await directName.press("End")
    await page.keyboard.type("取消内容")
    await directName.press("Escape")
    assert((await directName.textContent()) === stableName, "Escape did not restore direct-edit content.")

    await directName.focus()
    await page.keyboard.press("Tab")
    const tabTarget = await page.evaluate(() => ({
      path: document.activeElement?.getAttribute("data-edit-path"),
      visible: Boolean(document.activeElement?.getClientRects().length),
    }))
    assert(tabTarget.path && tabTarget.visible, `Tab left the visible preview fields: ${JSON.stringify(tabTarget)}`)

    highlight = page.locator('.resume-screen-pages [data-edit-path="experience.0.highlights.0"]').first()
    await highlight.click()
    await highlight.evaluate((element, text) => {
      element.innerText = text
    }, originalHighlight)
    await highlight.press("Control+Enter")
    await waitForStoredResume(page, resumeId, (resume) => resume.experience[0].highlights[0] === originalHighlight)

    const multiPageText = Array.from({ length: 90 }, (_, index) => `第 ${index + 1} 行跨页编辑验证`).join("\n")
    highlight = page.locator('.resume-screen-pages [data-edit-path="experience.0.highlights.0"]').first()
    await highlight.click()
    await highlight.evaluate((element, text) => {
      element.innerText = text
    }, multiPageText)
    await highlight.press("Control+Enter")
    await page.waitForFunction(() => document.querySelectorAll(".resume-screen-page").length > 1)

    await page.locator('.resume-screen-pages [data-edit-path="basics.name"]').first().focus()
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press("Tab")
      const focused = await page.evaluate(() => {
        const element = document.activeElement
        const pageElement = element?.closest?.(".resume-screen-page")

        if (!(element instanceof HTMLElement) || !(pageElement instanceof HTMLElement)) {
          return { path: null, visible: false }
        }

        const rect = element.getBoundingClientRect()
        const pageRect = pageElement.getBoundingClientRect()
        return {
          path: element.dataset.editPath || null,
          visible: Math.min(rect.bottom, pageRect.bottom) - Math.max(rect.top, pageRect.top) > 1,
        }
      })

      assert(focused.path && focused.visible, `Tab focused clipped multi-page content: ${JSON.stringify(focused)}`)
    }

    highlight = page.locator('.resume-screen-pages [data-edit-path="experience.0.highlights.0"]').first()
    await highlight.click()
    await highlight.evaluate((element, text) => {
      element.innerText = text
    }, originalHighlight)
    await highlight.press("Control+Enter")
    await page.waitForFunction(() => document.querySelectorAll(".resume-screen-page").length === 1)

    const fastName = page.locator('.resume-screen-pages [data-edit-path="basics.name"]').first()
    await fastName.click()
    await fastName.press("End")
    await page.keyboard.type("-即时保存")
    await page.getByRole("button", { name: "返回列表" }).click()
    await page.locator("[data-resume-id]").filter({ hasText: "交互回归简历" }).waitFor()
    await waitForStoredResume(page, resumeId, (resume) => resume.basics.name.endsWith("-即时保存"))

    await page.locator(`[data-resume-id="${resumeId}"]`).getByRole("button", { name: /编辑简历/ }).click()
    await page.getByLabel("简历标题").fill("交互回归简历-浏览器后退")
    await page.goBack()
    await page.locator("[data-resume-id]").waitFor()
    await waitForStoredResume(page, resumeId, (resume) => resume.title === "交互回归简历-浏览器后退")

    await page.locator(`[data-resume-id="${resumeId}"]`).getByRole("button", { name: /编辑简历/ }).click()
    await page.getByLabel("简历标题").fill("交互回归简历")
    await page.getByRole("button", { name: "保存", exact: true }).click()

    await page.getByRole("button", { name: "导出简历" }).click()
    await page.waitForFunction(() => document.activeElement?.textContent?.trim() === "JSON 备份")
    assert((await activeElementText(page)) === "JSON 备份", "Export menu did not focus its first item.")
    const downloadPromise = page.waitForEvent("download")
    await page.getByRole("menuitem", { name: "JSON 备份" }).click()
    const download = await downloadPromise
    const backupPath = path.join(outputDir, "interaction-resume-backup.json")
    await download.saveAs(backupPath)
    const backup = JSON.parse(await fs.readFile(backupPath, "utf8"))
    assert(backup.app === "resume-maker" && backup.resumes.length === 1, "JSON export is not a valid one-resume backup.")

    await page.getByRole("button", { name: "返回列表" }).click()
    const topMore = page.getByRole("button", { name: "更多操作" }).first()
    await topMore.click()
    const chooserPromise = page.waitForEvent("filechooser")
    await page.getByRole("menuitem", { name: "导入 JSON" }).click()
    const chooser = await chooserPromise
    await chooser.setFiles(backupPath)
    await page.getByText("已导入 1 份简历。").waitFor()
    await page.keyboard.press("Escape")
    assert((await page.locator("[data-resume-id]").count()) === 2, "JSON import did not add one cloned resume.")

    const originalCard = page.locator(`[data-resume-id="${resumeId}"]`)
    await originalCard.getByRole("button", { name: "更多操作" }).click()
    await originalCard.getByRole("menuitem", { name: "复制简历" }).click()
    await page.locator("[data-editor-panel]").waitFor()
    await page.getByRole("button", { name: "返回列表" }).click()
    assert((await page.locator("[data-resume-id]").count()) === 3, "Resume duplication did not add a card.")

    const duplicateCard = page.locator("[data-resume-id]").filter({ hasText: "交互回归简历 副本" }).first()
    await duplicateCard.getByRole("button", { name: "更多操作" }).click()
    page.once("dialog", (dialog) => dialog.accept())
    await duplicateCard.getByRole("menuitem", { name: "删除" }).click()
    await page.waitForFunction(() => document.querySelectorAll("[data-resume-id]").length === 2)

    await page.locator(`[data-resume-id="${resumeId}"]`).getByRole("button", { name: /编辑简历/ }).click()
    await page.getByRole("tab", { name: /经历/ }).click()
    const firstEntry = page.locator("[data-entry-card]").first()
    const entryCount = await page.locator("[data-entry-card]").count()
    await firstEntry.getByRole("button", { name: "复制" }).click()
    assert((await page.locator("[data-entry-card]").count()) === entryCount + 1, "Entry duplication failed.")
    page.once("dialog", (dialog) => dialog.accept())
    await page.locator("[data-entry-card]").nth(1).getByRole("button", { name: "删除经历" }).click()
    assert((await page.locator("[data-entry-card]").count()) === entryCount, "Entry deletion failed.")

    await page.getByRole("tab", { name: /技能/ }).click()
    const firstSkill = page.locator("[data-skill-editor-card]").first()
    const skillCount = await page.locator("[data-skill-editor-card]").count()
    page.once("dialog", (dialog) => dialog.dismiss())
    await firstSkill.getByRole("button", { name: "删除技能组" }).click()
    assert((await page.locator("[data-skill-editor-card]").count()) === skillCount, "Dismissed skill deletion changed data.")

    await page.getByRole("button", { name: "添加证书" }).click()
    const certificateCard = page.locator("[data-certificate-editor-card]").last()
    await certificateCard.getByLabel("名称").fill("交互测试证书")
    page.once("dialog", (dialog) => dialog.dismiss())
    await certificateCard.getByRole("button", { name: "删除证书" }).click()
    assert((await page.locator("[data-certificate-editor-card]").count()) === 1, "Dismissed certificate deletion changed data.")
    page.once("dialog", (dialog) => dialog.accept())
    await certificateCard.getByRole("button", { name: "删除证书" }).click()
    assert((await page.locator("[data-certificate-editor-card]").count()) === 0, "Confirmed certificate deletion failed.")

    await page.setViewportSize({ width: 390, height: 844 })
    await page.reload({ waitUntil: "networkidle" })
    await page.getByRole("button", { name: "预览", exact: true }).click()
    const mobileState = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      scale: Number(document.querySelector(".resume-screen-pages")?.getAttribute("data-screen-scale") || "1"),
      bottomNavVisible: Boolean(document.querySelector("nav")),
    }))
    assert(mobileState.bottomNavVisible && mobileState.scale < 1, `Mobile preview mode is not fitted: ${JSON.stringify(mobileState)}`)
    assert(mobileState.documentWidth <= mobileState.viewportWidth + 1, `Mobile page has horizontal overflow: ${JSON.stringify(mobileState)}`)

    const mobileShot = path.join(outputDir, "mobile-interactions.png")
    await page.screenshot({ path: mobileShot, fullPage: true })

    await page.emulateMedia({ media: "print" })
    const pdfPath = path.join(outputDir, "print-interactions.pdf")
    await page.pdf({ path: pdfPath, printBackground: true, preferCSSPageSize: true })
    const pages = await pdfPageCount(pdfPath)
    assert(pages === undefined || pages === 1, `Generic resume PDF unexpectedly has ${pages} pages.`)

    assert(browserErrors.length === 0, `Browser emitted errors:\n${browserErrors.join("\n")}`)

    console.log(JSON.stringify({
      ok: true,
      pdfPages: pages,
      artifacts: [dashboardShot, backupPath, mobileShot, pdfPath],
    }, null, 2))
  } finally {
    await browser.close()
    server?.kill()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
