import { useFormContext, useWatch, type FieldPath } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SectionShell } from "@/components/editor/SectionShell"
import type { Resume, ResumeDesign } from "@/types/resume"

const modernBodyFontRatio = 0.585
const classicBodyFontRatio = 0.594
const fontSizeOptions = [8, 9, 10, 10.5, 11, 12, 13, 14]

function visualFontSizeValue(value: number | undefined, ratio: number) {
  const base = Number.isFinite(value) ? Number(value) : 17

  return String(Math.round(base * ratio * 2) / 2)
}

function baseFontSizeFromVisual(value: string, ratio: number) {
  return Number((Number(value) / ratio).toFixed(2))
}

function FontSizeControl({
  label,
  ariaLabel,
  value,
  ratio,
  onChange,
}: {
  label: string
  ariaLabel: string
  value: number
  ratio: number
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={visualFontSizeValue(value, ratio)}
        onValueChange={(nextValue) => onChange(baseFontSizeFromVisual(nextValue, ratio))}
      >
        <SelectTrigger className="bg-white" aria-label={ariaLabel}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {fontSizeOptions.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}px
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function DesignSettingsForm() {
  const { control, setValue } = useFormContext<Resume>()
  const templateId = useWatch({ control, name: "templateId" })
  const designPrefix = templateId === "classic" ? "classicDesign" : "design"
  const design = useWatch({ control, name: designPrefix }) as ResumeDesign
  const isClassic = templateId === "classic"

  function updateDesignField<Key extends keyof ResumeDesign>(field: Key, value: ResumeDesign[Key]) {
    setValue(`${designPrefix}.${field}` as FieldPath<Resume>, value as never, {
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const accentColor = /^#[0-9a-f]{6}$/i.test(design.accentColor) ? design.accentColor : "#173b57"
  const awardLineGap = Number.isFinite(design.awardLineGap) ? Number(design.awardLineGap) : 0.18
  const photoRotate = Number.isFinite(design.photoRotate) ? Number(design.photoRotate) : 0

  return (
    <SectionShell title={`${isClassic ? "经典" : "现代"}模板设置`}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>主题色</Label>
          <div className="flex items-center gap-3">
            <Input
              type="color"
              className="h-10 w-16 p-1"
              value={accentColor}
              aria-label={`${isClassic ? "经典" : "现代"}模板主题色选择器`}
              onChange={(event) => updateDesignField("accentColor", event.target.value)}
            />
            <Input
              value={design.accentColor}
              onChange={(event) => updateDesignField("accentColor", event.target.value)}
              placeholder="#173b57"
              aria-label={`${isClassic ? "经典" : "现代"}模板主题色`}
            />
          </div>
        </div>

        {isClassic ? (
          <FontSizeControl
            label="正文字号"
            ariaLabel="经典正文字号"
            value={design.baseFontSize}
            ratio={classicBodyFontRatio}
            onChange={(value) => updateDesignField("baseFontSize", value)}
          />
        ) : (
          <>
            <FontSizeControl
              label="左栏字号"
              ariaLabel="左栏字号"
              value={design.sidebarFontSize}
              ratio={modernBodyFontRatio}
              onChange={(value) => updateDesignField("sidebarFontSize", value)}
            />
            <FontSizeControl
              label="右栏字号"
              ariaLabel="右栏字号"
              value={design.contentFontSize}
              ratio={modernBodyFontRatio}
              onChange={(value) => updateDesignField("contentFontSize", value)}
            />
          </>
        )}

        {!isClassic ? (
          <div className="space-y-2">
            <Label>荣誉行距</Label>
            <div className="flex items-center gap-3">
              <Input
                type="range"
                min="0"
                max="1.2"
                step="0.05"
                value={awardLineGap}
                onChange={(event) =>
                  updateDesignField(
                    "awardLineGap",
                    Number(Math.max(0, Math.min(1.2, Number(event.target.value))).toFixed(2)),
                  )
                }
              />
              <Input
                className="w-24 bg-white text-right"
                type="number"
                min="0"
                max="1.2"
                step="0.05"
                value={awardLineGap}
                onChange={(event) =>
                  updateDesignField(
                    "awardLineGap",
                    Number(Math.max(0, Math.min(1.2, Number(event.target.value))).toFixed(2)),
                  )
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">{awardLineGap.toFixed(2)} mm</p>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>排版密度</Label>
          <Select
            value={design.density}
            onValueChange={(value) => updateDesignField("density", value as ResumeDesign["density"])}
          >
            <SelectTrigger className="bg-white" aria-label={`${isClassic ? "经典" : "现代"}排版密度`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comfortable">舒展</SelectItem>
              <SelectItem value="compact">紧凑</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>照片形状</Label>
          <Select
            value={design.photoShape}
            onValueChange={(value) => updateDesignField("photoShape", value as ResumeDesign["photoShape"])}
          >
            <SelectTrigger className="bg-white" aria-label={`${isClassic ? "经典" : "现代"}照片形状`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circle">圆形</SelectItem>
              <SelectItem value="rounded">圆角方形</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>照片适配</Label>
          <Select
            value={design.photoFit}
            onValueChange={(value) => updateDesignField("photoFit", value as ResumeDesign["photoFit"])}
          >
            <SelectTrigger className="bg-white" aria-label={`${isClassic ? "经典" : "现代"}照片适配`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contain">完整显示</SelectItem>
              <SelectItem value="cover">填满裁切</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>照片位置</Label>
          <Select
            value={design.photoPosition}
            onValueChange={(value) => updateDesignField("photoPosition", value as ResumeDesign["photoPosition"])}
          >
            <SelectTrigger className="bg-white" aria-label={`${isClassic ? "经典" : "现代"}照片位置`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">靠上</SelectItem>
              <SelectItem value="center">居中</SelectItem>
              <SelectItem value="bottom">靠下</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>照片旋转</Label>
          <div className="flex items-center gap-3">
            <Input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={photoRotate}
              onChange={(event) => updateDesignField("photoRotate", Number(event.target.value))}
            />
            <Input
              className="w-20 bg-white text-right"
              type="number"
              min="-5"
              max="5"
              step="0.5"
              value={photoRotate}
              onChange={(event) => updateDesignField("photoRotate", Number(event.target.value))}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            className="size-4 rounded border-input accent-[var(--primary)]"
            checked={design.showPhoto}
            onChange={(event) => updateDesignField("showPhoto", event.target.checked)}
          />
          显示照片
        </label>
      </div>
    </SectionShell>
  )
}
