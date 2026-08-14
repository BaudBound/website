"use client";

import { AlertTriangle, CheckCircle2, Info, Megaphone, X } from "lucide-react";
import { useState } from "react";

import { dismissAnnouncement } from "@/app/announcement-actions";
import { MarkdownContent } from "@/components/markdown-content";
import type { Announcement, AnnouncementKind } from "@/lib/announcements";
import { cn } from "@/lib/utils";

type AnnouncementBannerProps = {
	announcement: Announcement | null;
	initiallyDismissed: boolean;
};

const kindStyles: Record<AnnouncementKind, string> = {
	info: "border-sky-400/30 bg-sky-400/10 text-sky-100",
	warning: "border-amber-300/35 bg-amber-300/12 text-amber-50",
	success: "border-emerald-300/30 bg-emerald-300/10 text-emerald-50",
	critical: "border-brand/50 bg-brand/14 text-brand-foreground",
};

const icons = {
	info: Info,
	warning: AlertTriangle,
	success: CheckCircle2,
	critical: Megaphone,
};

export function AnnouncementBanner({ announcement, initiallyDismissed }: AnnouncementBannerProps) {
	const [isDismissed, setIsDismissed] = useState(initiallyDismissed);

	if (!announcement || isDismissed) {
		return null;
	}

	const Icon = icons[announcement.kind];
	const hasLink = announcement.linkUrl && announcement.linkLabel;

	return (
		<div className={cn("sticky top-0 z-50 border-b px-4 py-2.5 backdrop-blur", kindStyles[announcement.kind])}>
			<div className="mx-auto flex max-w-7xl items-center gap-3 text-sm leading-6">
				<Icon className="size-4 shrink-0" aria-hidden="true" />
				<div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1">
					<MarkdownContent compact className="font-semibold text-foreground">
						{announcement.title}
					</MarkdownContent>
					<span className="text-current/55">/</span>
					<MarkdownContent compact className="text-current/86">
						{announcement.message}
					</MarkdownContent>
					{hasLink && (
						<a
							href={announcement.linkUrl}
							target={announcement.linkUrl.startsWith("/") ? undefined : "_blank"}
							rel={announcement.linkUrl.startsWith("/") ? undefined : "noopener noreferrer"}
							className="ml-3 whitespace-nowrap font-semibold text-foreground underline underline-offset-4 hover:text-current"
						>
							{announcement.linkLabel}
						</a>
					)}
				</div>
				{announcement.dismissable && (
					<button
						type="button"
						className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-current/70 transition hover:bg-white/10 hover:text-foreground"
						aria-label="Dismiss announcement"
						onClick={() => {
							setIsDismissed(true);
							void dismissAnnouncement(announcement.dismissKey);
						}}
					>
						<X className="size-4" aria-hidden="true" />
					</button>
				)}
			</div>
		</div>
	);
}
