import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

// Serve the approved, unchanged symbol for browsers requesting the default icon.
export async function GET() {
  const image = await readFile(join(process.cwd(), "assets/symbol-only-brand-navy.png"));
  return new Response(image, { headers: { "Content-Type": "image/png" } });
}
