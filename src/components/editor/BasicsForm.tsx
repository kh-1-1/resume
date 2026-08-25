import { Controller, useFormContext, useWatch } from "react-hook-form"
import { DesignSettingsForm } from "@/components/editor/DesignSettingsForm"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/editor/FormField"
import { PhotoUpload } from "@/components/editor/PhotoUpload"
import { SectionShell } from "@/components/editor/SectionShell"
import type { Resume } from "@/types/resume"

export function BasicsForm() {
  const { control, register } = useFormContext<Resume>()
  const design = useWatch({ control, name: "design" })

  return (
    <div className="space-y-4">
      <SectionShell title="基础信息" description="用于简历顶部的姓名、岗位和联系方式。">
        <Controller
          control={control}
          name="basics.photo"
          render={({ field }) => <PhotoUpload value={field.value} design={design} onChange={field.onChange} />}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="姓名" layout="inline">
            <Input {...register("basics.name")} placeholder="张三" />
          </FormField>
          <FormField label="目标岗位" layout="inline">
            <Input {...register("basics.jobTitle")} placeholder="前端工程师" />
          </FormField>
          <FormField label="邮箱" layout="inline">
            <Input {...register("basics.email")} placeholder="name@example.com" />
          </FormField>
          <FormField label="手机" layout="inline">
            <Input {...register("basics.phone")} placeholder="138 0000 0000" />
          </FormField>
          <FormField label="城市" layout="inline">
            <Input {...register("basics.location")} placeholder="上海" />
          </FormField>
          <FormField label="政治面貌" layout="inline">
            <Input {...register("basics.politicalStatus")} placeholder="中共党员" />
          </FormField>
          <FormField label="个人网站" layout="inline">
            <Input {...register("basics.website")} placeholder="https://example.com" />
          </FormField>
          <FormField label="GitHub" layout="inline">
            <Input {...register("basics.github")} placeholder="github.com/yourname" />
          </FormField>
          <FormField label="LinkedIn" layout="inline">
            <Input {...register("basics.linkedin")} placeholder="linkedin.com/in/yourname" />
          </FormField>
        </div>
      </SectionShell>

      <DesignSettingsForm />

      <SectionShell title="个人总结" description="建议 2 到 4 句，突出经验年限、方向和可量化成果。">
        <FormField label="摘要">
          <Textarea
            {...register("summary")}
            placeholder="例如：3 年前端开发经验，熟悉 React、TypeScript 和工程化体系..."
            rows={6}
          />
        </FormField>
      </SectionShell>
    </div>
  )
}
