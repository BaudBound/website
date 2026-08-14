export type AnnouncementKind = "info" | "warning" | "success" | "critical";

export type Announcement = {
	id: string;
	title: string;
	message: string;
	kind: AnnouncementKind;
	linkLabel: string;
	linkUrl: string;
	dismissable: boolean;
	dismissKey: string;
};

type PocketBaseListResponse = {
	items?: PocketBaseAnnouncementRecord[];
};

type PocketBaseAnnouncementRecord = {
	created?: unknown;
	id?: unknown;
	title?: unknown;
	message?: unknown;
	kind?: unknown;
	linkLabel?: unknown;
	linkUrl?: unknown;
	dismissable?: unknown;
	updated?: unknown;
};

const pocketBaseUrl =
	process.env.POCKETBASE_URL ?? process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "https://api.baudbound.app";
const announcementsPath = "/api/collections/announcements/records";
const activeAnnouncementFilter =
	'active = true && (startsAt = "" || startsAt <= @now) && (endsAt = "" || endsAt >= @now)';
const announcementKinds = new Set<AnnouncementKind>(["info", "warning", "success", "critical"]);

function text(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
}

function bool(value: unknown) {
	return value === true;
}

function kind(value: unknown): AnnouncementKind {
	return typeof value === "string" && announcementKinds.has(value as AnnouncementKind)
		? (value as AnnouncementKind)
		: "info";
}

function safeLinkUrl(value: unknown) {
	const url = text(value);

	if (!url) {
		return "";
	}

	if (url.startsWith("/")) {
		return url;
	}

	try {
		const parsed = new URL(url);
		return parsed.protocol === "https:" || parsed.protocol === "http:" ? url : "";
	} catch {
		return "";
	}
}

function mapAnnouncement(record: PocketBaseAnnouncementRecord): Announcement | null {
	const id = text(record.id);
	const title = text(record.title);
	const message = text(record.message);
	const updated = text(record.updated);

	if (!id || !title || !message) {
		return null;
	}

	return {
		id,
		title,
		message,
		kind: kind(record.kind),
		linkLabel: text(record.linkLabel),
		linkUrl: safeLinkUrl(record.linkUrl),
		dismissable: bool(record.dismissable),
		dismissKey: `${id}:${updated || text(record.created)}`,
	};
}

export async function getCurrentAnnouncement(): Promise<Announcement | null> {
	const url = new URL(announcementsPath, pocketBaseUrl);
	url.searchParams.set("page", "1");
	url.searchParams.set("perPage", "1");
	url.searchParams.set("sort", "-priority,-created");
	url.searchParams.set("filter", activeAnnouncementFilter);

	try {
		const response = await fetch(url, {
			headers: {
				Accept: "application/json",
			},
			next: {
				revalidate: 60,
			},
		});

		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as PocketBaseListResponse;
		const [record] = data.items ?? [];
		return record ? mapAnnouncement(record) : null;
	} catch {
		return null;
	}
}
