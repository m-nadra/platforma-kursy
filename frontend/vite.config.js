import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src")
		}
	},
	// server: {
	// 	proxy: {
	// 		"/api": {
	// 			target: "http://backend:3000",
	// 			changeOrigin: true
	// 		}
	// 	}
	// },
};