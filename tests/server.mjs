import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = path.resolve(process.env.BASELINE_ROOT || path.join(root, '..', 'colorvision-baseline'));
const mime = {'.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.woff2':'font/woff2'};
export function startServer(port = 4173) {
  const server = http.createServer(async (req,res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const isBaseline = url.pathname.startsWith('/__baseline__/');
      const prefix = isBaseline ? '/__baseline__/MY-ColorVision/' : '/MY-ColorVision/';
      if (!url.pathname.startsWith(prefix)) { res.writeHead(404).end(); return; }
      const base = isBaseline ? baseline : root;
      const file = path.resolve(base, decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html');
      if (!file.startsWith(base + path.sep)) { res.writeHead(403).end(); return; }
      const info = await stat(file);
      if (!info.isFile()) { res.writeHead(404).end(); return; }
      res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store'});
      res.end(await readFile(file));
    } catch { res.writeHead(404).end(); }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await startServer();
  console.log('Color Vision test server: http://127.0.0.1:4173/MY-ColorVision/');
}
