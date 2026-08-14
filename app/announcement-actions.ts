"use server";

import { cookies } from "next/headers";

import { announcementDismissCookieName } from "@/lib/announcement-dismissal";

const dismissCookieMaxAge = 60 * 60 * 24 * 365;

export async function dismissAnnouncement(dismissKey: string) {
	const cookieStore = await cookies();

	cookieStore.set({
		name: announcementDismissCookieName,
		value: encodeURIComponent(dismissKey),
		httpOnly: true,
		maxAge: dismissCookieMaxAge,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
	});
}
