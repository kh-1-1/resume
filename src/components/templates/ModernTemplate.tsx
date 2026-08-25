import { type CSSProperties, type ReactNode } from "react"
import {
  InlineEditableJoinedText,
  InlineEditableText,
} from "@/components/preview/InlineEditableText"
import {
  certificateGroups,
  getCertificateDisplayName,
  getCertificateGroupCount,
  getCertificateGroupId,
  shouldHighlightCertificate,
} from "@/constants/certificateGroups"
import type { Resume } from "@/types/resume"
import { formatDateRange } from "@/utils/date"
import { getExperienceDateLabel } from "@/utils/experience"
import { RichText } from "./RichText"
import {
  alphaColor,
  getInitials,
  getResumeDesign,
  hasResumeContent,
  hasText,
  photoObjectStyle,
  resumeContentFontSize,
  resumeSidebarFontSize,
} from "./templateUtils"

type TemplateProps = {
  resume: Resume
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}

type EntryProps = {
  title: string
  subtitle?: ReactNode
  inlineSubtitle?: boolean
  centerSubtitle?: boolean
  titleTone?: "default" | "accent"
  meta?: string
  children?: ReactNode
  editPath?: string
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}

function MainSection({
  title,
  children,
  titleStyle = "line",
  editPath,
  editable,
  onEdit,
}: {
  title: string
  children: ReactNode
  titleStyle?: "line" | "filled"
  editPath: string
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}) {
  return (
    <section>
      <div
        className="flex items-center gap-[2.5mm]"
        style={{ marginBottom: "var(--resume-heading-gap)" }}
      >
        <h2
          className={
            titleStyle === "filled"
              ? "w-[18mm] shrink-0 whitespace-nowrap bg-[var(--resume-accent)] px-[1.4mm] py-[0.85mm] text-center text-[0.625em] font-extrabold tracking-[0.08em] text-white"
              : "shrink-0 text-[0.595em] font-bold tracking-[0.08em] text-[var(--resume-accent)]"
          }
        >
          <InlineEditableText enabled={editable} path={editPath} value={title} onCommit={onEdit}>
            {title}
          </InlineEditableText>
        </h2>
        <div className="h-px flex-1 bg-[var(--resume-accent-title)]/35" />
      </div>
      <div className="flex flex-col" style={{ gap: "var(--resume-entry-gap)" }}>
        {children}
      </div>
    </section>
  )
}

function SideSection({
  title,
  children,
  editPath,
  editable,
  onEdit,
}: {
  title: string
  children: ReactNode
  editPath: string
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}) {
  return (
    <section>
      <h2
        className="text-[0.595em] font-bold tracking-[0.08em] text-[var(--resume-accent)]"
        style={{ marginBottom: "var(--resume-side-title-gap)" }}
      >
        <InlineEditableText enabled={editable} path={editPath} value={title} onCommit={onEdit}>
          {title}
        </InlineEditableText>
      </h2>
      {children}
    </section>
  )
}

function Entry({
  title,
  subtitle,
  inlineSubtitle = true,
  centerSubtitle = false,
  titleTone = "default",
  meta,
  children,
  editPath,
  editable,
  onEdit,
}: EntryProps) {
  const titleClassName =
    titleTone === "accent"
      ? "min-w-0 truncate text-[0.7em] font-bold leading-snug text-[var(--resume-accent-title)]"
      : "min-w-0 truncate text-[0.7em] font-bold leading-snug text-slate-950"
  const inlineTitleClassName =
    titleTone === "accent"
      ? "shrink-0 text-[0.7em] font-bold leading-snug text-[var(--resume-accent-title)]"
      : "shrink-0 text-[0.7em] font-bold leading-snug text-slate-950"
  const blockTitleClassName =
    titleTone === "accent"
      ? "text-[0.7em] font-bold leading-snug text-[var(--resume-accent-title)]"
      : "text-[0.7em] font-bold leading-snug text-slate-950"

  if (centerSubtitle && subtitle) {
    return (
      <div className="break-inside-avoid">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-baseline gap-[3mm]">
          <h3 className={titleClassName}>
            <InlineEditableText enabled={editable} path={editPath} value={title} onCommit={onEdit}>
              {title}
            </InlineEditableText>
          </h3>
          <p className="max-w-[72mm] truncate text-center text-[0.6em] font-bold leading-snug text-[var(--resume-accent-title)]">
            {subtitle}
          </p>
          {meta ? <p className="min-w-0 truncate text-right text-[0.58em] leading-snug text-slate-950">{meta}</p> : null}
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="break-inside-avoid">
      <div className="grid grid-cols-[1fr_auto] gap-[5mm]">
        <div className="min-w-0">
          {inlineSubtitle ? (
            <div className="flex min-w-0 items-baseline gap-[2.5mm]">
              <h3 className={inlineTitleClassName}>
                <InlineEditableText enabled={editable} path={editPath} value={title} onCommit={onEdit}>
                  {title}
                </InlineEditableText>
              </h3>
              {subtitle ? (
                <p className="min-w-0 truncate text-[0.6em] leading-snug text-slate-950">{subtitle}</p>
              ) : null}
            </div>
          ) : (
            <>
              <h3 className={blockTitleClassName}>
                <InlineEditableText enabled={editable} path={editPath} value={title} onCommit={onEdit}>
                  {title}
                </InlineEditableText>
              </h3>
              {subtitle ? (
                <p className="mt-[0.35mm] text-[0.6em] leading-snug text-slate-950">{subtitle}</p>
              ) : null}
            </>
          )}
        </div>
        {meta ? <p className="shrink-0 text-right text-[0.58em] leading-snug text-slate-950">{meta}</p> : null}
      </div>
      {children}
    </div>
  )
}

function BulletList({
  items,
  boldPrefix = false,
  editPath,
  editable,
  onEdit,
}: {
  items: string[]
  boldPrefix?: boolean
  editPath?: string
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}) {
  const visibleItems = items
    .map((item, index) => ({ item: item.trim(), index }))
    .filter(({ item }) => Boolean(item))

  if (!visibleItems.length) {
    return null
  }

  return (
    <div
      role="list"
      data-resume-body-text
      className="mt-[1.05mm] space-y-[0.7mm] pl-[0.6mm] text-[0.585em] text-slate-950"
      style={{ lineHeight: "var(--resume-body-line-height)" }}
    >
      {visibleItems.map(({ item, index }) => (
        <div role="listitem" className="break-inside-avoid" key={`${index}-${item}`}>
          <InlineEditableText
            enabled={editable}
            multiline
            path={editPath ? `${editPath}.${index}` : undefined}
            value={item}
            onCommit={onEdit}
          >
            <BulletText item={item} boldPrefix={boldPrefix} />
          </InlineEditableText>
        </div>
      ))}
    </div>
  )
}

function BulletText({ item, boldPrefix }: { item: string; boldPrefix: boolean }) {
  const match = item.match(/^([^：:]{2,14})[：:](.+)$/)

  if (!match) {
    return <RichText text={item} strongClassName="font-bold text-slate-950" />
  }

  return (
    <>
      <span className={boldPrefix ? "font-bold text-slate-950" : "font-medium text-slate-900"}>
        {match[1]}：
      </span>
      <RichText text={match[2]} strongClassName="font-bold text-slate-950" />
    </>
  )
}

function formatExperienceMeta(item: Resume["experience"][number]) {
  return getExperienceDateLabel(item)
}

const awardTitleClampStyle = {
  display: "-webkit-box",
  WebkitBoxOrient: "vertical",
  WebkitLineClamp: 2,
  overflow: "hidden",
} as CSSProperties

function AwardGroupList({
  resume,
  layout = "side",
  editable,
  onEdit,
}: {
  resume: Resume
  layout?: "side" | "main"
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}) {
  const sourceIndex = new Map(resume.certificates.map((item, index) => [item.id, index]))
  const groups = certificateGroups
    .map((group) => {
      const items = resume.certificates
        .filter((item) => getCertificateGroupId(item) === group.id)
        .sort((a, b) => (sourceIndex.get(a.id) ?? 999) - (sourceIndex.get(b.id) ?? 999))

      return {
        title: group.title,
        items,
      }
    })
    .filter((group) => group.items.length)

  if (!groups.length) {
    return null
  }

  const isMain = layout === "main"
  const design = getResumeDesign(resume)
  const awardLineGap = Math.max(
    0,
    Math.min(1.2, Number.isFinite(design.awardLineGap) ? design.awardLineGap : 0.18),
  )
  const awardItemGap = 0.28 + awardLineGap * 0.75
  const awardTitleLineHeight = Math.min(1.26, 1.16 + awardLineGap * 0.08)

  return (
    <div
      className={
        isMain
          ? "grid grid-cols-3 gap-x-[5mm] gap-y-[2mm] text-[0.52em] leading-[1.45] text-slate-950"
          : "-mx-[1mm] flex flex-col text-[0.585em] leading-[1.32] text-slate-950"
      }
      style={isMain ? undefined : { gap: "var(--resume-award-group-gap)" }}
    >
      {groups.map((group) => (
        <div
          key={group.title}
          className={
            isMain
              ? "break-words"
              : "break-words border-l-[1.5px] border-[var(--resume-accent)] bg-white/35 pl-[1.7mm] pr-[1mm]"
          }
          style={isMain ? undefined : { paddingBlock: "var(--resume-award-group-padding-y)" }}
        >
          <div className="mb-[0.6mm] flex items-baseline justify-between gap-[1mm]">
            <h3 className="min-w-0 text-[1em] font-bold leading-tight text-slate-950">{group.title}</h3>
            <span className="shrink-0 text-[0.72em] font-semibold leading-tight text-[var(--resume-accent)]">
              {getCertificateGroupCount(group.items)}项
            </span>
          </div>
          <div role="list">
            {group.items.map((item, index) => (
              <div
                role="listitem"
                key={item.id}
                style={{ marginTop: index ? `${awardItemGap}mm` : undefined }}
                title={item.name}
              >
                <span
                  className={shouldHighlightCertificate(item) ? "block font-bold text-slate-950" : "block"}
                  style={{ ...awardTitleClampStyle, lineHeight: awardTitleLineHeight }}
                >
                  <InlineEditableText
                    enabled={editable}
                    path={`certificates.${sourceIndex.get(item.id) ?? 0}.displayName`}
                    value={getCertificateDisplayName(item)}
                    onCommit={onEdit}
                  >
                    {getCertificateDisplayName(item)}
                  </InlineEditableText>
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ModernTemplate({ resume, editable, onEdit }: TemplateProps) {
  const design = getResumeDesign(resume)
  const internshipExperience = resume.experience.filter((item) => item.kind === "internship")
  const workExperience = resume.experience.filter((item) => item.kind === "work")
  const campusExperience = resume.experience.filter((item) => item.kind === "campus")
  const volunteerExperience = resume.experience.filter((item) => item.kind === "volunteer")
  const experienceIndex = new Map(resume.experience.map((item, index) => [item.id, index]))
  const inferredPartyMember =
    [
      resume.summary,
      ...resume.education.flatMap((item) => item.highlights),
      ...resume.experience.flatMap((item) => item.highlights),
      ...resume.projects.flatMap((item) => item.highlights),
    ].some((item) => item.includes("中共党员"))
  const politicalStatus = resume.basics.politicalStatus.trim() || (inferredPartyMember ? "中共党员" : "")
  const profileItems = [
    { label: "政治面貌", value: politicalStatus, path: "basics.politicalStatus" },
    { label: "邮箱", value: resume.basics.email, path: "basics.email" },
    { label: "电话", value: resume.basics.phone, path: "basics.phone" },
    { label: "所在地", value: resume.basics.location, path: "basics.location" },
    { label: "个人网站", value: resume.basics.website, path: "basics.website" },
    { label: "GitHub", value: resume.basics.github, path: "basics.github" },
    { label: "LinkedIn", value: resume.basics.linkedin, path: "basics.linkedin" },
  ].filter((item) => hasText(item.value))
  const visibleProfileItems = profileItems.length
    ? profileItems
    : [
        { label: "邮箱", value: "待填写", path: "basics.email" },
        { label: "电话", value: "待填写", path: "basics.phone" },
        { label: "所在地", value: "待填写", path: "basics.location" },
      ]
  const rootStyle = {
    "--resume-accent": design.accentColor,
    "--resume-accent-title": alphaColor(design.accentColor, "bf"),
    "--resume-accent-soft": alphaColor(design.accentColor, "12"),
    "--resume-main-padding-y": design.density === "compact" ? "4.5mm" : "7mm",
    "--resume-main-section-gap": design.density === "compact" ? "2.1mm" : "3mm",
    "--resume-heading-gap": design.density === "compact" ? "1.1mm" : "1.4mm",
    "--resume-entry-gap": design.density === "compact" ? "2.05mm" : "2.3mm",
    "--resume-body-line-height": design.density === "compact" ? "1.34" : "1.35",
    "--resume-side-padding-y": design.density === "compact" ? "4.5mm" : "6.5mm",
    "--resume-side-header-gap": design.density === "compact" ? "3.2mm" : "4.2mm",
    "--resume-side-photo-gap": design.density === "compact" ? "2.7mm" : "3.5mm",
    "--resume-side-section-gap": design.density === "compact" ? "2.35mm" : "3.15mm",
    "--resume-side-title-gap": design.density === "compact" ? "1.1mm" : "1.5mm",
    "--resume-side-skill-gap": design.density === "compact" ? "1.05mm" : "1.35mm",
    "--resume-award-group-gap": design.density === "compact" ? "1.15mm" : "1.55mm",
    "--resume-award-group-padding-y": design.density === "compact" ? "0.65mm" : "0.95mm",
  } as CSSProperties
  const photoStyle = photoObjectStyle(design)

  return (
    <article data-resume-content className="grid min-h-[297mm] grid-cols-[56mm_1fr] font-sans text-slate-950" style={rootStyle}>
      <aside
        className="px-[6mm]"
        style={{
          backgroundColor: alphaColor(design.accentColor, "10"),
          fontSize: resumeSidebarFontSize(design),
          paddingTop: "var(--resume-side-padding-y)",
          paddingBottom: "var(--resume-side-padding-y)",
        }}
      >
        <div className="text-center" style={{ marginBottom: "var(--resume-side-header-gap)" }}>
          {design.showPhoto && resume.basics.photo ? (
            <div
              className="mx-auto overflow-hidden bg-white shadow-sm"
              style={{
                width: design.photoShape === "circle" ? "25mm" : "27mm",
                height: design.photoShape === "circle" ? "25mm" : "34mm",
                borderRadius: design.photoShape === "circle" ? "999px" : "5px",
                border: `1px solid ${design.accentColor}`,
                marginBottom: "var(--resume-side-photo-gap)",
              }}
            >
              <img
                src={resume.basics.photo}
                alt="简历照片"
                className="h-full w-full"
                style={photoStyle}
              />
            </div>
          ) : (
            <div
              className="mx-auto mb-[3.5mm] h-[22mm] w-[22mm] text-center text-[22px] font-bold leading-[22mm] text-white"
              style={{
                backgroundColor: design.accentColor,
                borderRadius: design.photoShape === "circle" ? "999px" : "7px",
              }}
            >
              {getInitials(resume.basics.name || "姓名")}
            </div>
          )}

          <h1 className="text-[1.16em] font-bold leading-none tracking-normal text-slate-950">
            <InlineEditableText
              enabled={editable}
              path="basics.name"
              value={resume.basics.name || "姓名"}
              onCommit={onEdit}
            >
              {resume.basics.name || "姓名"}
            </InlineEditableText>
          </h1>
          {hasText(resume.basics.jobTitle) ? (
            <p className="mt-[2mm] text-[0.625em] font-semibold leading-[1.35] text-[var(--resume-accent)]">
              <InlineEditableText
                enabled={editable}
                path="basics.jobTitle"
                value={resume.basics.jobTitle}
                onCommit={onEdit}
              >
                {resume.basics.jobTitle}
              </InlineEditableText>
            </p>
          ) : null}
        </div>

        <div className="flex flex-col" style={{ gap: "var(--resume-side-section-gap)" }}>
          <SideSection
            title={resume.sectionTitles.profile}
            editPath="sectionTitles.profile"
            editable={editable}
            onEdit={onEdit}
          >
            <div data-resume-sidebar-text className="space-y-[1.05mm] text-[0.585em] leading-[1.35] text-slate-950">
              {visibleProfileItems.map((item) => (
                <div key={item.label} className="grid grid-cols-[13mm_minmax(0,1fr)] gap-x-[1.2mm]">
                  <span className="whitespace-nowrap font-semibold text-[var(--resume-accent)]">{item.label}</span>
                  <span className={`min-w-0 break-words ${item.value.includes("党员") ? "font-bold" : ""}`}>
                    <InlineEditableText enabled={editable} path={item.path} value={item.value} onCommit={onEdit}>
                      {item.value}
                    </InlineEditableText>
                  </span>
                </div>
              ))}
            </div>
          </SideSection>

          {hasText(resume.summary) ? (
            <SideSection
              title={resume.sectionTitles.summary}
              editPath="sectionTitles.summary"
              editable={editable}
              onEdit={onEdit}
            >
              <p className="text-[0.585em] leading-[1.35] text-slate-950">
                <InlineEditableText
                  enabled={editable}
                  multiline
                  path="summary"
                  value={resume.summary}
                  onCommit={onEdit}
                >
                  <RichText text={resume.summary} strongClassName="font-bold text-slate-950" />
                </InlineEditableText>
              </p>
            </SideSection>
          ) : null}

          {resume.skills.length ? (
            <SideSection
              title={resume.sectionTitles.skills}
              editPath="sectionTitles.skills"
              editable={editable}
              onEdit={onEdit}
            >
              <div
                className="flex flex-col text-[0.585em] leading-[1.3] text-slate-950"
                style={{ gap: "var(--resume-side-skill-gap)" }}
              >
                {resume.skills.map((group, groupIndex) => (
                  <div key={group.id} data-skill-group className="break-words">
                    <h3 className="mb-[0.45mm] font-bold leading-tight text-[var(--resume-accent)]">
                      <InlineEditableText
                        enabled={editable}
                        path={`skills.${groupIndex}.name`}
                        value={group.name || "技能"}
                        onCommit={onEdit}
                      >
                        {group.name || "技能"}
                      </InlineEditableText>
                    </h3>
                    <div role="list" className="flex flex-wrap gap-x-[0.65mm] gap-y-[0.35mm]">
                      {group.skills
                        .map((skill, skillIndex) => ({ skill: skill.trim(), skillIndex }))
                        .filter(({ skill }) => Boolean(skill))
                        .map(({ skill, skillIndex }, index, skills) => (
                          <span role="listitem" key={`${skillIndex}-${skill}`} className="inline-flex items-baseline gap-[0.65mm]">
                            <InlineEditableText
                              enabled={editable}
                              path={`skills.${groupIndex}.skills.${skillIndex}`}
                              value={skill}
                              onCommit={onEdit}
                            >
                              {skill}
                            </InlineEditableText>
                            {index < skills.length - 1 ? <span aria-hidden="true">·</span> : null}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </SideSection>
          ) : null}

          {resume.certificates.length ? (
            <SideSection
              title={resume.sectionTitles.certificates}
              editPath="sectionTitles.certificates"
              editable={editable}
              onEdit={onEdit}
            >
              <AwardGroupList resume={resume} editable={editable} onEdit={onEdit} />
            </SideSection>
          ) : null}

        </div>
      </aside>

      <main
        className="flex flex-col pl-[6mm] pr-[8mm]"
        style={{
          fontSize: resumeContentFontSize(design),
          gap: "var(--resume-main-section-gap)",
          paddingTop: "var(--resume-main-padding-y)",
          paddingBottom: "var(--resume-main-padding-y)",
        }}
      >
        {!hasResumeContent(resume) ? (
          <div className="mt-[18mm] border border-dashed border-slate-300 px-[8mm] py-[12mm] text-center text-[0.6875em] text-slate-500">
            在左侧填写内容后，这里会生成可打印的 A4 简历。
          </div>
        ) : null}

        {resume.education.length ? (
          <MainSection
            title={resume.sectionTitles.education}
            titleStyle="filled"
            editPath="sectionTitles.education"
            editable={editable}
            onEdit={onEdit}
          >
            {resume.education.map((item, index) => (
              <Entry
                key={item.id}
                title={item.school || "学校名称"}
                subtitle={
                  <InlineEditableJoinedText
                    enabled={editable}
                    fields={[
                      { path: `education.${index}.degree`, value: item.degree },
                      { path: `education.${index}.major`, value: item.major },
                    ]}
                    onCommit={onEdit}
                  />
                }
                inlineSubtitle
                centerSubtitle
                titleTone="accent"
                meta={formatDateRange(item.startDate, item.endDate, item.current)}
                editPath={`education.${index}.school`}
                editable={editable}
                onEdit={onEdit}
              >
                <BulletList
                  items={item.highlights}
                  editPath={`education.${index}.highlights`}
                  editable={editable}
                  onEdit={onEdit}
                />
              </Entry>
            ))}
          </MainSection>
        ) : null}

        {internshipExperience.length ? (
          <MainSection
            title={resume.sectionTitles.internship}
            titleStyle="filled"
            editPath="sectionTitles.internship"
            editable={editable}
            onEdit={onEdit}
          >
            {internshipExperience.map((item) => (
              <Entry
                key={item.id}
                title={item.position || "职位"}
                subtitle={
                  <InlineEditableJoinedText
                    enabled={editable}
                    fields={[
                      { path: `experience.${experienceIndex.get(item.id) ?? 0}.company`, value: item.company },
                      { path: `experience.${experienceIndex.get(item.id) ?? 0}.location`, value: item.location },
                    ]}
                    onCommit={onEdit}
                  />
                }
                centerSubtitle
                titleTone="accent"
                meta={formatExperienceMeta(item)}
                editPath={`experience.${experienceIndex.get(item.id) ?? 0}.position`}
                editable={editable}
                onEdit={onEdit}
              >
                <BulletList
                  items={item.highlights}
                  boldPrefix
                  editPath={`experience.${experienceIndex.get(item.id) ?? 0}.highlights`}
                  editable={editable}
                  onEdit={onEdit}
                />
              </Entry>
            ))}
          </MainSection>
        ) : null}

        {workExperience.length ? (
          <MainSection
            title={resume.sectionTitles.work}
            titleStyle="filled"
            editPath="sectionTitles.work"
            editable={editable}
            onEdit={onEdit}
          >
            {workExperience.map((item) => (
              <Entry
                key={item.id}
                title={item.position || "职位"}
                subtitle={
                  <InlineEditableJoinedText
                    enabled={editable}
                    fields={[
                      { path: `experience.${experienceIndex.get(item.id) ?? 0}.company`, value: item.company },
                      { path: `experience.${experienceIndex.get(item.id) ?? 0}.location`, value: item.location },
                    ]}
                    onCommit={onEdit}
                  />
                }
                centerSubtitle
                titleTone="accent"
                meta={formatExperienceMeta(item)}
                editPath={`experience.${experienceIndex.get(item.id) ?? 0}.position`}
                editable={editable}
                onEdit={onEdit}
              >
                <BulletList
                  items={item.highlights}
                  boldPrefix
                  editPath={`experience.${experienceIndex.get(item.id) ?? 0}.highlights`}
                  editable={editable}
                  onEdit={onEdit}
                />
              </Entry>
            ))}
          </MainSection>
        ) : null}

        {resume.projects.length ? (
          <MainSection
            title={resume.sectionTitles.projects}
            titleStyle="filled"
            editPath="sectionTitles.projects"
            editable={editable}
            onEdit={onEdit}
          >
            {resume.projects.map((item, index) => (
              <Entry
                key={item.id}
                title={item.name || "项目名称"}
                titleTone="accent"
                meta={formatDateRange(item.startDate, item.endDate)}
                editPath={`projects.${index}.name`}
                editable={editable}
                onEdit={onEdit}
              >
                <BulletList
                  items={item.highlights}
                  boldPrefix
                  editPath={`projects.${index}.highlights`}
                  editable={editable}
                  onEdit={onEdit}
                />
              </Entry>
            ))}
          </MainSection>
        ) : null}

        {campusExperience.length ? (
          <MainSection
            title={resume.sectionTitles.campus}
            titleStyle="filled"
            editPath="sectionTitles.campus"
            editable={editable}
            onEdit={onEdit}
          >
            {campusExperience.map((item) => (
              <Entry
                key={item.id}
                title={item.position || "任职"}
                titleTone="accent"
                meta={formatExperienceMeta(item)}
                editPath={`experience.${experienceIndex.get(item.id) ?? 0}.position`}
                editable={editable}
                onEdit={onEdit}
              >
                <BulletList
                  items={item.highlights}
                  editPath={`experience.${experienceIndex.get(item.id) ?? 0}.highlights`}
                  editable={editable}
                  onEdit={onEdit}
                />
              </Entry>
            ))}
          </MainSection>
        ) : null}

        {volunteerExperience.length ? (
          <MainSection
            title={resume.sectionTitles.volunteer}
            titleStyle="filled"
            editPath="sectionTitles.volunteer"
            editable={editable}
            onEdit={onEdit}
          >
            {volunteerExperience.map((item) => (
              <Entry
                key={item.id}
                title={item.position || "服务项目"}
                subtitle={
                  <InlineEditableJoinedText
                    enabled={editable}
                    fields={[
                      { path: `experience.${experienceIndex.get(item.id) ?? 0}.company`, value: item.company },
                      { path: `experience.${experienceIndex.get(item.id) ?? 0}.location`, value: item.location },
                    ]}
                    onCommit={onEdit}
                  />
                }
                centerSubtitle
                titleTone="accent"
                meta={formatExperienceMeta(item)}
                editPath={`experience.${experienceIndex.get(item.id) ?? 0}.position`}
                editable={editable}
                onEdit={onEdit}
              >
                <BulletList
                  items={item.highlights}
                  editPath={`experience.${experienceIndex.get(item.id) ?? 0}.highlights`}
                  editable={editable}
                  onEdit={onEdit}
                />
              </Entry>
            ))}
          </MainSection>
        ) : null}

      </main>
    </article>
  )
}
