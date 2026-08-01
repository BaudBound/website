import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";

async function availablePort() {
	const server = createServer();
	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	const address = server.address();
	assert(address && typeof address === "object");
	const { port } = address;
	server.close();
	await once(server, "close");
	return port;
}

const port = await availablePort();
const output = [];
const serverArguments =
	process.platform === "win32"
		? ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)]
		: [".next/standalone/server.js"];
const server = spawn(process.execPath, serverArguments, {
	env: {
		...process.env,
		HOSTNAME: "127.0.0.1",
		PORT: String(port),
		UMAMI_TRACKER_SRC: "https://analytics.example.test/script.js",
		UMAMI_WEBSITE_ID: "production-server-test",
	},
	stdio: ["ignore", "pipe", "pipe"],
});

server.stdout.on("data", (chunk) => output.push(chunk.toString()));
server.stderr.on("data", (chunk) => output.push(chunk.toString()));

try {
	let response;
	for (let attempt = 0; attempt < 100; attempt += 1) {
		try {
			response = await fetch(`http://127.0.0.1:${port}/`);
			break;
		} catch {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	assert(response, `Website server did not become ready.\n${output.join("")}`);
	assert.equal(response.status, 200);
	const contentSecurityPolicy = response.headers.get("content-security-policy") ?? "";
	assert.match(contentSecurityPolicy, /default-src 'self'/);
	assert.match(contentSecurityPolicy, /object-src 'none'/);
	assert.match(contentSecurityPolicy, /frame-ancestors 'self'/);
	assert.match(contentSecurityPolicy, /https:\/\/analytics\.example\.test/);
	assert.equal(response.headers.get("cross-origin-opener-policy"), "same-origin");
	assert.equal(response.headers.get("cross-origin-resource-policy"), "same-origin");
	assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
	assert.equal(response.headers.get("strict-transport-security"), "max-age=63072000; includeSubDomains; preload");
	assert.equal(response.headers.get("x-content-type-options"), "nosniff");
	assert.equal(response.headers.get("x-frame-options"), "SAMEORIGIN");
	console.log("Production website server and security headers verified.");
} finally {
	if (server.exitCode === null && server.signalCode === null) {
		const exited = once(server, "exit");
		server.kill();
		await exited;
	}
}
