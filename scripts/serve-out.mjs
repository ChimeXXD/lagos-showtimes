// Tiny static server for the built site (out/), used by Playwright. No dependencies.
// Resolves clean URLs the way static hosts do: /about -> about.html, /dir/ -> dir/index.html.
import { createServer } from "node:http";
import { existsSync, readFileSync, statSync } from "node:fs";
import { extname, join, normalize, sep } from "node:path";

const OUT = join(import.meta.dirname, "..", "out");
const port = Number(process.argv[2] ?? 4173);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};

function resolve(urlPath) {
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null; // malformed percent-encoding: answer 404, do not crash the server
  }
  const base = join(OUT, normalize(decoded));
  if (base !== OUT && !base.startsWith(OUT + sep)) return null;
  const candidates = [base, `${base}.html`, join(base, "index.html")];
  return candidates.find((p) => existsSync(p) && statSync(p).isFile()) ?? null;
}

createServer((req, res) => {
  const file = resolve(req.url ?? "/");
  if (!file) {
    const notFound = join(OUT, "404.html");
    res.writeHead(404, { "content-type": TYPES[".html"] });
    res.end(existsSync(notFound) ? readFileSync(notFound) : "Not found");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(port, "127.0.0.1", () => console.log(`Serving out/ on http://127.0.0.1:${port}`));
