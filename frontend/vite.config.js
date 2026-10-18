import path from "node:path";
import tailwind from "@tailwindcss/vite"
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const proxyConfig = {
	target: `http://${process.env.BACKEND_HOST}:${process.env.BACKEND_PORT}`,
	changeOrigin: true
}

export default {
	plugins: [react(), tailwind()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src")
		}
	},
	server: {
		port: process.env.FRONTEND_PORT,
		proxy: {
			"/api": proxyConfig,
			"/uploads": proxyConfig
		}
	}
};