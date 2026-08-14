export const announcementDismissCookieName = "bb_announcement_dismissed";

export function decodeDismissedAnnouncementKey(value: string | undefined) {
	if (!value) {
		return "";
	}

	try {
		return decodeURIComponent(value);
	} catch {
		return "";
	}
}
