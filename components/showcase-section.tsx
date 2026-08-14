import { BrowserFrame } from "@/components/browser-frame";
import { SectionHeading } from "@/components/section-heading";
import type { HomeContentResult } from "@/lib/site-content";

export function ShowcaseSection({ content }: { content: HomeContentResult }) {
	return (
		<section className="px-5.5 pb-16 sm:px-16 sm:pb-32.5">
			<SectionHeading eyebrow="SEE IT IN ACTION" title="From canvas to machine" className="mb-7 text-center sm:mb-13" />

			{content.ok ? (
				<div className="flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-center sm:gap-8">
					<BrowserFrame
						label="editor.baudbound.app"
						image={content.content.editorImage}
						alt="BaudBound editor node graph canvas"
						width={2550}
						height={1276}
					/>
					<BrowserFrame
						label="BaudBound Runner"
						variant="label"
						image={content.content.runnerImage}
						alt="BaudBound runner package approval view"
						width={1120}
						height={760}
					/>
				</div>
			) : (
				<div className="mx-auto max-w-2xl border border-border bg-card px-5 py-4 text-center text-sm text-muted-foreground">
					{content.error}
				</div>
			)}
		</section>
	);
}
