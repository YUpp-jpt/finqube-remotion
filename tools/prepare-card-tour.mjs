import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {copyFile, mkdir, readFile, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cli = path.join(path.dirname(require.resolve('@remotion/cli/package.json')), 'remotion-cli.js');

export async function prepareCardTour(rendererOptions = []) {
  const hash = createHash('sha256');
  for (const file of ['src/CardTour.tsx','src/TourField.tsx','src/Stage.tsx','src/components.tsx','src/SceneFilm.tsx','src/Lens.tsx','src/Root.tsx','pnpm-lock.yaml']) hash.update(await readFile(path.join(root, file)));
  const signature = hash.digest('hex');
  const cacheDir = path.join(root, '.cache');
  const output = path.join(root, 'public/card-tour-source.mp4');
  const cacheFile = path.join(cacheDir, 'card-tour.json');
  await mkdir(cacheDir, {recursive: true});
  let cached;
  try {cached = JSON.parse(await readFile(cacheFile, 'utf8'));} catch {}
  if (cached?.signature === signature && existsSync(output)) return;
  if (existsSync(output)) await copyFile(output, path.join(cacheDir, `card-tour-${cached?.signature ?? 'previous'}.mp4`));
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, 'render', 'src/index.ts', 'FinqubeCardTourSource', output, '--codec=h264','--pixel-format=yuv420p','--crf=12','--concurrency=2',...rendererOptions,'--overwrite=true'], {cwd:root,stdio:'inherit',windowsHide:true});
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve() : reject(new Error(`Card-tour source render failed (${code}).`)));
  });
  await writeFile(cacheFile, JSON.stringify({signature,frames:360,fps:60}, null, 2) + '\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareCardTour(process.argv.slice(2).filter(argument => argument !== '--')).catch(error => {console.error(error.message); process.exitCode=1;});
}
