import type { CSSProperties, ReactNode } from "react"
import {
  InlineEditableJoinedText,
  InlineEditableText,
} from "@/components/preview/InlineEditableText"
import { getCertificateDisplayName } from "@/constants/certificateGroups"
import type { Resume } from "@/types/resume"
import { formatDateRange, formatMonth } from "@/utils/date"
import { getExperienceDateLabel } from "@/utils/experience"
import { RichText } from "./RichText"
import {
  compact,
  contactItems,
  getResumeDesign,
  hasResumeContent,
  hasText,
  photoObjectStyle,
  resumeFontSize,
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
  meta?: string
  children?: ReactNode
  editPath?: string
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}

function SectionTitle({
  title,
  editPath,
  editable,
  onEdit,
}: {
  title: string
  editPath: string
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}) {
  return (
    <div className="flex items-center gap-[2.5mm]" style={{ marginBottom: "var(--classic-heading-gap)" }}>
      <h2 className="shrink-0 text-[0.5625em] font-bold tracking-[0.12em] text-[var(--resume-accent)]">
        <InlineEditableText enabled={editable} path={editPath} value={title} onCommit={onEdit}>
          {title}
        </InlineEditableText>
      </h2>
      <div className="h-px flex-1 bg-stone-300" />
    </div>
  )
}

function Section({
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
    <section className="border-t border-stone-200 pt-[var(--classic-section-padding)] first:border-t-0 first:pt-0">
      <SectionTitle title={title} editPath={editPath} editable={editable} onEdit={onEdit} />
      <div className="flex flex-col" style={{ gap: "var(--classic-entry-gap)" }}>{children}</div>
    </section>
  )
}

function MiniSection({
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
      <SectionTitle title={title} editPath={editPath} editable={editable} onEdit={onEdit} />
      {children}
    </section>
  )
}

function Entry({ title, subtitle, inlineSubtitle = true, meta, children, editPath, editable, onEdit }: EntryProps) {
  return (
    <div className="break-inside-avoid">
      <div className="grid grid-cols-[1fr_auto] gap-[5mm]">
        <div className="min-w-0">
          {inlineSubtitle ? (
            <div className="flex min-w-0 items-baseline gap-[2.5mm]">
              <h3 className="shrink-0 text-[0.675em] font-bold leading-snug text-stone-950">
                <InlineEditableText enabled={editable} path={editPath} value={title} onCommit={onEdit}>
                  {title}
                </InlineEditableText>
              </h3>
              {subtitle ? (
                <p className="min-w-0 truncate text-[0.5875em] leading-snug text-stone-950">{subtitle}</p>
              ) : null}
            </div>
          ) : (
            <>
              <h3 className="text-[0.675em] font-bold leading-snug text-stone-950">
                <InlineEditableText enabled={editable} path={editPath} value={title} onCommit={onEdit}>
                  {title}
                </InlineEditableText>
              </h3>
              {subtitle ? (
                <p className="mt-[0.4mm] text-[0.5875em] leading-snug text-stone-950">{subtitle}</p>
              ) : null}
            </>
          )}
        </div>
        {meta ? (
          <p className="shrink-0 text-right text-[0.575em] leading-snug text-stone-950">
            {meta}
          </p>
        ) : null}
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
      data-classic-body-text
      className="mt-[1.1mm] flex flex-col pl-[0.7mm] text-[0.594em] text-stone-950"
      style={{ gap: "var(--classic-body-gap)", lineHeight: "var(--classic-body-line-height)" }}
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
    return <RichText text={item} strongClassName="font-bold text-stone-950" />
  }

  return (
    <>
      <span className={boldPrefix ? "font-bold text-stone-950" : "font-medium text-stone-900"}>
        {match[1]}：
      </span>
      <RichText text={match[2]} strongClassName="font-bold text-stone-950" />
    </>
  )
}

function formatExperienceMeta(item: Resume["experience"][number]) {
  return getExperienceDateLabel(item)
}

function SkillsBlock({
  resume,
  editable,
  onEdit,
}: {
  resume: Resume
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}) {
  if (!resume.skills.length) {
    return null
  }

  return (
    <div className="flex flex-col text-[0.5875em] leading-[1.38] text-stone-950" style={{ gap: "var(--classic-entry-gap)" }}>
      {resume.skills.map((group, groupIndex) => (
        <p key={group.id}>
          <span className="font-bold text-stone-950">
            <InlineEditableText
              enabled={editable}
              path={`skills.${groupIndex}.name`}
              value={group.name || "技能"}
              onCommit={onEdit}
            >
              {group.name || "技能"}
            </InlineEditableText>
            ：
          </span>
          {group.skills
            .map((skill, skillIndex) => ({ skill: skill.trim(), skillIndex }))
            .filter(({ skill }) => Boolean(skill))
            .map(({ skill, skillIndex }, index) => (
              <span key={`${skillIndex}-${skill}`}>
                {index ? " / " : ""}
                <InlineEditableText
                  enabled={editable}
                  path={`skills.${groupIndex}.skills.${skillIndex}`}
                  value={skill}
                  onCommit={onEdit}
                >
                  {skill}
                </InlineEditableText>
              </span>
            ))}
        </p>
      ))}
    </div>
  )
}

function AwardList({
  resume,
  editable,
  onEdit,
}: {
  resume: Resume
  editable?: boolean
  onEdit?: (path: string, value: string) => void
}) {
  const awards = resume.certificates

  if (!awards.length) {
    return null
  }

  return (
    <ul className="flex flex-col text-[0.575em] leading-[1.35] text-stone-950" style={{ gap: "var(--classic-body-gap)" }}>
      {awards.map((item, index) => (
        <li key={item.id}>
          <span className="font-bold text-stone-950">
            <InlineEditableText
              enabled={editable}
              path={`certificates.${index}.displayName`}
              value={getCertificateDisplayName(item)}
              onCommit={onEdit}
            >
              {getCertificateDisplayName(item)}
            </InlineEditableText>
          </span>
          {item.issuer ? ` · ${item.issuer}` : ""}
          {item.date ? ` · ${formatMonth(item.date)}` : ""}
        </li>
      ))}
    </ul>
  )
}

export function ClassicTemplate({ resume, editable, onEdit }: TemplateProps) {
  const contacts = contactItems(resume)
  const profileItems = compact([resume.basics.politicalStatus, ...contacts])
  const design = getResumeDesign(resume)
  const photoStyle = photoObjectStyle(design)
  const rootStyle = {
    "--resume-accent": design.accentColor,
    "--classic-page-padding-y": design.density === "compact" ? "7.5mm" : "10.5mm",
    "--classic-main-gap": design.density === "compact" ? "3mm" : "4mm",
    "--classic-section-padding": design.density === "compact" ? "2.3mm" : "3mm",
    "--classic-heading-gap": design.density === "compact" ? "1.35mm" : "2mm",
    "--classic-entry-gap": design.density === "compact" ? "2.15mm" : "2.8mm",
    "--classic-body-gap": design.density === "compact" ? "0.55mm" : "0.8mm",
    "--classic-body-line-height": design.density === "compact" ? "1.34" : "1.38",
    borderColor: design.accentColor,
    fontSize: resumeFontSize(design),
  } as CSSProperties
  const professionalExperience = resume.experience.filter(
    (item) => item.kind === "internship" || item.kind === "work",
  )
  const campusExperience = resume.experience.filter(
    (item) => item.kind === "campus" || item.kind === "volunteer",
  )
  const experienceIndex = new Map(resume.experience.map((item, index) => [item.id, index]))

  return (
    <article
      data-resume-content
      data-template-id="classic"
      className="min-h-[297mm] px-[12.5mm] font-sans text-stone-950"
      style={{
        ...rootStyle,
        paddingTop: "var(--classic-page-padding-y)",
        paddingBottom: "var(--classic-page-padding-y)",
      }}
    >
      <header className="border-b-[2px] pb-[3.2mm]" style={{ borderColor: design.accentColor }}>
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-[5mm]">
          {design.showPhoto && resume.basics.photo ? (
            <div
              className="overflow-hidden bg-white"
              style={{
                width: design.photoShape === "circle" ? "22mm" : "22mm",
                height: design.photoShape === "circle" ? "22mm" : "28mm",
                border: `1.6px solid ${design.accentColor}`,
                borderRadius: design.photoShape === "circle" ? "999px" : "6px",
              }}
            >
              <img
                src={resume.basics.photo}
                alt="简历照片"
                className="h-full w-full"
                style={photoStyle}
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="mb-[1mm] text-[0.53125em] font-bold uppercase tracking-[0.24em] text-[var(--resume-accent)]">
              个人简历
            </p>
            <h1 className="text-[1.5625em] font-bold leading-none tracking-normal text-stone-950">
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
              <p className="mt-[1.6mm] text-[0.7em] font-semibold leading-tight text-stone-950">
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
          <p className="max-w-[66mm] text-right text-[0.556em] leading-[1.5] text-stone-950">
            {profileItems.length ? profileItems.join(" · ") : "邮箱 · 电话 · 城市"}
          </p>
        </div>
      </header>

      {!hasResumeContent(resume) ? (
        <div className="mt-[28mm] border border-dashed border-stone-300 px-[10mm] py-[12mm] text-center text-[0.6875em] text-stone-500">
          在左侧填写内容后，这里会生成可打印的 A4 简历。
        </div>
      ) : null}

      <main className="mt-[3mm] flex flex-col" style={{ gap: "var(--classic-main-gap)" }}>
        {resume.education.length ? (
          <Section
            title={resume.sectionTitles.education}
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
          </Section>
        ) : null}

        {hasText(resume.summary) ? (
          <Section
            title={resume.sectionTitles.summary}
            editPath="sectionTitles.summary"
            editable={editable}
            onEdit={onEdit}
          >
            <p className="whitespace-pre-line text-[0.594em] leading-[1.42] text-stone-950">
              <InlineEditableText
                enabled={editable}
                multiline
                path="summary"
                value={resume.summary}
                onCommit={onEdit}
              >
                <RichText text={resume.summary} strongClassName="font-bold text-stone-950" />
              </InlineEditableText>
            </p>
          </Section>
        ) : null}

        {professionalExperience.length ? (
          <Section
            title={resume.sectionTitles.professionalExperience}
            editPath="sectionTitles.professionalExperience"
            editable={editable}
            onEdit={onEdit}
          >
            {professionalExperience.map((item) => (
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
          </Section>
        ) : null}

        {resume.projects.length ? (
          <Section
            title={resume.sectionTitles.projects}
            editPath="sectionTitles.projects"
            editable={editable}
            onEdit={onEdit}
          >
            {resume.projects.map((item, index) => (
              <Entry
                key={item.id}
                title={item.name || "项目名称"}
                subtitle={compact([item.role, compact(item.techStack).join(" / ")]).join(" · ")}
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
          </Section>
        ) : null}

        {campusExperience.length ? (
          <Section
            title={resume.sectionTitles.campusVolunteer}
            editPath="sectionTitles.campusVolunteer"
            editable={editable}
            onEdit={onEdit}
          >
            {campusExperience.map((item) => (
              <Entry
                key={item.id}
                title={item.position || "任职"}
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
          </Section>
        ) : null}

        {(resume.skills.length || resume.certificates.length) ? (
          <div
            className={`grid gap-[7mm] border-t border-stone-200 pt-[var(--classic-section-padding)] ${
              resume.skills.length && resume.certificates.length ? "grid-cols-[0.9fr_1.1fr]" : "grid-cols-1"
            }`}
          >
            {resume.skills.length ? (
              <MiniSection
                title={resume.sectionTitles.skills}
                editPath="sectionTitles.skills"
                editable={editable}
                onEdit={onEdit}
              >
                <SkillsBlock resume={resume} editable={editable} onEdit={onEdit} />
              </MiniSection>
            ) : null}
            {resume.certificates.length ? (
              <MiniSection
                title={resume.sectionTitles.certificates}
                editPath="sectionTitles.certificates"
                editable={editable}
                onEdit={onEdit}
              >
                <AwardList resume={resume} editable={editable} onEdit={onEdit} />
              </MiniSection>
            ) : null}
          </div>
        ) : null}
      </main>
    </article>
  )
}
