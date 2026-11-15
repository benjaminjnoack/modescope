// Minimal static file server with live reload. No dependencies.
// Run: node server.js   (or: npm start)

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 3000;
// Everything the browser loads lives in public/.
const ROOT = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

// Injected into every HTML page: reloads the page when the server says so,
// and shows JavaScript errors on the page itself, for testing on a phone,
// which has no developer tools. (Listening in the capture phase also
// catches scripts and stylesheets that fail to load.) It's injected at the
// end of <body>, so it runs before the deferred main.js module.
const RELOAD_SNIPPET = `
<script>
  new EventSource("/__reload").addEventListener("reload", () => location.reload());

  (() => {
    let box = null;
    const report = (message) => {
      if (!box) {
        box = document.createElement("pre");
        box.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:99999;margin:0;" +
          "padding:8px 12px;max-height:40vh;overflow:auto;white-space:pre-wrap;" +
          "font:12px/1.4 ui-monospace,monospace;color:#fff;background:#b3261e;";
        box.addEventListener("click", () => { box.remove(); box = null; });
        document.body.append(box);
      }
      box.textContent += message + "\\n";
    };
    window.addEventListener("error", (event) => {
      const el = event.target;
      if (el && el !== window && (el.src || el.href)) {
        report("Failed to load " + (el.src || el.href));
      } else {
        const where = event.filename ? " (" + event.filename.replace(location.origin, "") +
          ":" + event.lineno + ":" + event.colno + ")" : "";
        report(event.message + where);
      }
    }, true);
    window.addEventListener("unhandledrejection", (event) => {
      report("Unhandled promise rejection: " + (event.reason && event.reason.stack || event.reason));
    });
  })();
</script>`;

const clients = new Set();

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);

  if (urlPath === "/__reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write(": connected\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  let filePath = path.join(ROOT, urlPath);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || "application/octet-stream";
    if (ext === ".html") {
      const html = data.toString();
      data = html.includes("</body>")
        ? html.replace("</body>", RELOAD_SNIPPET + "\n</body>")
        : html + RELOAD_SNIPPET;
    }
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-store" });
    res.end(data);
  });
});

// Watch public/ and tell connected pages to reload (debounced).
let timer = null;
fs.watch(ROOT, { recursive: true }, (_event, filename) => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    console.log(`Changed: ${filename} — reloading ${clients.size} page(s)`);
    for (const client of clients) client.write("event: reload\ndata: \n\n");
  }, 100);
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`);
});
