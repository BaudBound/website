import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		webpackMemoryOptimizations: true,
	},
	images: {
		qualities: [75, 100],
		remotePatterns: [
			{
				hostname: "api.baudbound.app",
				protocol: "https",
			},
		],
	},
};

export default nextConfig;
