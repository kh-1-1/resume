import { useRef } from "react"
import { ImagePlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ResumeDesign } from "@/types/resume"

type PhotoUploadProps = {
  value: string
  design?: ResumeDesign
  onChange: (value: string) => void
}

const maxPhotoSize = 2.5 * 1024 * 1024

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("请选择图片文件"))
      return
    }

    if (file.size > maxPhotoSize) {
      reject(new Error("照片建议小于 2.5MB，请压缩后再导入"))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("读取图片失败"))
    reader.readAsDataURL(file)
  })
}

function previewImageStyle(design?: ResumeDesign) {
  const rotate = Number.isFinite(design?.photoRotate) ? Math.max(-5, Math.min(5, design?.photoRotate ?? 0)) : 0
  const objectPosition =
    design?.photoPosition === "top"
      ? "center top"
      : design?.photoPosition === "bottom"
        ? "center bottom"
        : "center center"

  return {
    objectFit: design?.photoFit === "cover" ? "cover" : "contain",
    objectPosition,
    transform: `rotate(${rotate}deg) scale(${rotate === 0 ? 1 : 1.03})`,
    transformOrigin: "center center",
  } as const
}

export function PhotoUpload({ value, design, onChange }: PhotoUploadProps) {
  const isRounded = design?.photoShape === "rounded"
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) {
      return
    }

    try {
      onChange(await readImage(file))
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "照片导入失败")
    } finally {
      input.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-white p-4 sm:flex-row sm:items-center">
      <div
        className="flex shrink-0 items-center justify-center overflow-hidden border border-border bg-secondary"
        style={{
          width: isRounded ? "5.5rem" : "6rem",
          height: isRounded ? "7rem" : "6rem",
          borderRadius: isRounded ? "0.5rem" : "999px",
        }}
      >
        {value ? (
          <img src={value} alt="简历照片预览" className="h-full w-full bg-white" style={previewImageStyle(design)} />
        ) : (
          <ImagePlus className="size-8 text-muted-foreground" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm font-medium text-foreground">照片</p>
        <p className="text-sm text-muted-foreground">
          支持 JPG、PNG、WebP，建议小于 2.5MB。照片只保存在当前浏览器的 IndexedDB，不会上传服务器。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus />
            导入照片
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleChange}
          />
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm("确定移除当前照片吗？")) {
                  onChange("")
                }
              }}
            >
              <Trash2 />
              移除
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
