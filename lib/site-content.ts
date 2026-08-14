export type HomeContentResult =
	| {
			content: HomeContent;
			ok: true;
	  }
	| {
			error: string;
			ok: false;
	  };

export type HomeContent = {
	editorImage: string;
	runnerImage: string;
};

export type PrivacyContentResult =
	| {
			content: PrivacyContent;
			ok: true;
	  }
	| {
			error: string;
			ok: false;
	  };

export type PrivacyContent = {
	effective: string;
	privacy: string;
	title: string;
};

type PocketBaseRecord = {
	collectionId?: unknown;
	id?: unknown;
	[key: string]: unknown;
};

type PocketBaseListResponse = {
	items?: PocketBaseRecord[];
};

const pocketBaseUrl =
	process.env.POCKETBASE_URL ?? process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "https://api.baudbound.app";

function text(value: unknown) {
	return typeof value === "string" ? value.trim() : "";
}

function fileName(value: unknown) {
	if (Array.isArray(value)) {
		return typeof value[0] === "string" ? value[0] : "";
	}

	return typeof value === "string" ? value : "";
}

function fileUrl(record: PocketBaseRecord, field: string) {
	const rawFileName = fileName(record[field]);
	const collectionId = text(record.collectionId);
	const id = text(record.id);

	if (!rawFileName || !collectionId || !id) {
		return "";
	}

	const url = new URL(`/api/files/${collectionId}/${id}/${rawFileName}`, pocketBaseUrl);
	return url.toString();
}

async function getSingleRecord(collectionName: "home" | "privacy") {
	const url = new URL(`/api/collections/${collectionName}/records`, pocketBaseUrl);
	url.searchParams.set("page", "1");
	url.searchParams.set("perPage", "1");
	url.searchParams.set("sort", "-updated");

	const response = await fetch(url, {
		headers: {
			Accept: "application/json",
		},
		next: {
			revalidate: 60,
		},
	});

	if (!response.ok) {
		throw new Error(`${collectionName} content request failed with ${response.status}`);
	}

	const data = (await response.json()) as PocketBaseListResponse;
	return data.items?.[0] ?? null;
}

export async function getHomeContent(): Promise<HomeContentResult> {
	try {
		const record = await getSingleRecord("home");

		if (!record) {
			return { ok: false, error: "Home content is missing." };
		}

		const editorImage = fileUrl(record, "editorImage");
		const runnerImage = fileUrl(record, "runnerImage");

		if (!editorImage || !runnerImage) {
			return { ok: false, error: "Home images are missing." };
		}

		return {
			ok: true,
			content: {
				editorImage,
				runnerImage,
			},
		};
	} catch {
		return { ok: false, error: "Home content could not be loaded." };
	}
}

export async function getPrivacyContent(): Promise<PrivacyContentResult> {
	try {
		const record = await getSingleRecord("privacy");

		if (!record) {
			return { ok: false, error: "Privacy policy is missing." };
		}

		const title = text(record.title);
		const privacy = text(record.privacy);
		const effective = text(record.effective);

		if (!title || !privacy || !effective) {
			return { ok: false, error: "Privacy policy content is incomplete." };
		}

		return {
			ok: true,
			content: {
				effective,
				privacy,
				title,
			},
		};
	} catch {
		return { ok: false, error: "Privacy policy could not be loaded." };
	}
}
