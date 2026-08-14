import type { Metadata } from "next";

import { MarkdownContent } from "@/components/markdown-content";
import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPrivacyContent } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
	const result = await getPrivacyContent();

	return {
		title: result.ok ? `${result.content.title} | BaudBound` : "Privacy Policy | BaudBound",
		description: result.ok ? `Effective ${result.content.effective}` : "Privacy policy is unavailable.",
	};
}

export default async function PrivacyPage() {
	const result = await getPrivacyContent();

	return (
		<>
			<SiteHeader />
			<main className="px-5.5 py-13 sm:px-16 sm:py-28">
				<div className="mx-auto max-w-2xl">
					{result.ok ? (
						<>
							<SectionHeading eyebrow="LEGAL" title={result.content.title} className="mb-5 sm:mb-8" />

							<p className="mb-7 font-mono text-[13px] text-muted-foreground sm:mb-12">
								Effective {result.content.effective}
							</p>

							<MarkdownContent className="text-[15px] leading-relaxed text-muted-foreground [&_a:hover]:text-brand [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground">
								{result.content.privacy}
							</MarkdownContent>
						</>
					) : (
						<div className="border border-border bg-card px-5 py-4 text-sm text-muted-foreground">{result.error}</div>
					)}
				</div>
			</main>
			<SiteFooter />
		</>
	);
}
