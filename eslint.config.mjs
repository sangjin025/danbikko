import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default defineConfig([...nextVitals, ...nextTypescript, globalIgnores([".next/**", ".next-e2e/**", ".next-empty-e2e/**", ".yarn/**", "next-env.d.ts", "test-results/**"])]);
