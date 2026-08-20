import { execFile } from 'node:child_process';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = new URL('../', import.meta.url);
const sourceUrl = new URL('src/grok-ball.js', root);
const htmlUrl = new URL('index.html', root);
const tempUrl = new URL('.index.html.build-tmp', root);
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const [{ stdout: minified }, html] = await Promise.all([
  execFileAsync(npx, [
    '--yes',
    'terser@5.44.0',
    fileURLToPath(sourceUrl),
    '--compress',
    'passes=2',
    '--mangle',
    '--comments',
    '/^!/',
  ], { maxBuffer: 2 * 1024 * 1024 }),
  readFile(htmlUrl, 'utf8'),
]);

if (!minified.includes('window.GrokBall')) {
  throw new Error('Minified engine is missing the GrokBall facade.');
}

const enginePattern = /  <script(?: data-grok-ball-engine)?>[\s\S]*?  <\/script>/;
if (!enginePattern.test(html)) {
  throw new Error('Could not locate the inline engine script in index.html.');
}

const inline = [
  '  <script data-grok-ball-engine>',
  minified.trim(),
  '  </script>',
].join('\n');
const output = html.replace(enginePattern, inline);

await writeFile(tempUrl, output, 'utf8');
await rename(tempUrl, htmlUrl);

const saved = Buffer.byteLength(html) - Buffer.byteLength(output);
console.log(`Updated index.html; saved ${saved.toLocaleString()} bytes.`);
