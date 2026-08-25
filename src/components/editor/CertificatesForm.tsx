import { Plus, Trash2 } from "lucide-react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormField } from "@/components/editor/FormField"
import { SectionShell } from "@/components/editor/SectionShell"
import { certificateGroups } from "@/constants/certificateGroups"
import type { Resume } from "@/types/resume"
import { createEmptyCertificate } from "@/utils/createEmptyResume"

export function CertificatesForm() {
  const { control, getValues, register } = useFormContext<Resume>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: "certificates",
    keyName: "fieldKey",
  })

  return (
    <SectionShell
      title="证书"
      description="可填写证书、奖项、认证或比赛结果。"
      action={
        <Button type="button" size="sm" onClick={() => append(createEmptyCertificate())}>
          <Plus />
          添加证书
        </Button>
      }
    >
      {fields.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-white/70 px-4 py-6 text-sm text-muted-foreground">
          还没有证书。
        </p>
      ) : null}

      {fields.map((field, index) => (
        <div
          key={field.fieldKey}
          data-certificate-editor-card
          className="rounded-md border border-border bg-white p-3 transition-colors focus-within:border-accent/60 focus-within:ring-1 focus-within:ring-ring"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">证书 {index + 1}</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="删除证书"
              aria-label="删除证书"
              onClick={() => {
                const certificate = getValues(`certificates.${index}`)
                const name = (certificate.displayName || certificate.name).trim() || `证书 ${index + 1}`

                if (window.confirm(`确定删除「${name}」吗？`)) {
                  remove(index)
                }
              }}
            >
              <Trash2 />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="名称" layout="inline">
              <Input {...register(`certificates.${index}.name`)} placeholder="证书或奖项名称" />
            </FormField>
            <FormField label="预览标题" layout="inline">
              <Input
                {...register(`certificates.${index}.displayName`)}
                placeholder="左侧栏显示的短标题，可不填"
              />
            </FormField>
            <FormField label="分类" layout="inline">
              <Controller
                control={control}
                name={`certificates.${index}.groupId`}
                render={({ field: selectField }) => (
                  <Select value={selectField.value || "other"} onValueChange={selectField.onChange}>
                    <SelectTrigger className="bg-white" aria-label="荣誉分类">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {certificateGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <FormField label="次数" layout="inline">
              <Input
                type="number"
                min="1"
                max="20"
                step="1"
                {...register(`certificates.${index}.count`, {
                  setValueAs: (value) => {
                    const count = Number(value)

                    return Number.isFinite(count) ? Math.max(1, Math.min(20, Math.round(count))) : 1
                  },
                })}
              />
            </FormField>
            <FormField label="样式" layout="inline">
              <label className="flex h-9 items-center gap-2 rounded-md bg-slate-50 px-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  className="size-4 accent-emerald-700"
                  {...register(`certificates.${index}.featured`)}
                />
                <span>重点显示</span>
              </label>
            </FormField>
            <FormField label="颁发方" layout="inline">
              <Input {...register(`certificates.${index}.issuer`)} placeholder="机构 / 主办方" />
            </FormField>
            <FormField label="日期" layout="inline">
              <Input type="month" {...register(`certificates.${index}.date`)} />
            </FormField>
            <FormField label="链接" layout="inline">
              <Input {...register(`certificates.${index}.url`)} placeholder="https://..." />
            </FormField>
          </div>
        </div>
      ))}
    </SectionShell>
  )
}
