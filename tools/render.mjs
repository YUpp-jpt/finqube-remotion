import {spawn} from 'node:child_process';
import {access, mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cli = path.join(path.dirname(require.resolve('@remotion/cli/package.json')), 'remotion-cli.js');

const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
};

const run = (args) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, args, {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  });
  child.once('error', reject);
  child.once('close', (code, signal) => {
    if (code === 0) resolve();
    else reject(new Error(`Render process stopped (${signal ?? code}).`));
  });
});

try {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('pnpm run render [--output path/to/video.mp4] [Remotion options]\nDefault: renders/finqube.mp4. Existing outputs are preserved.');
  } else {
    let outputName = 'renders/finqube.mp4';
    const extra = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === '--') continue;
      if (args[i] === '--output' || args[i] === '-o') {
        if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error('--output needs a file path.');
        outputName = args[++i];
      } else if (args[i].startsWith('--output=')) {
        outputName = args[i].slice('--output='.length);
      } else {
        extra.push(args[i]);
      }
    }
    if (!outputName) throw new Error('--output needs a file path.');
    const output = path.resolve(root, outputName);
    if (await exists(output)) throw new Error(`Output already exists. Choose another --output path: ${output}`);
    await mkdir(path.dirname(output), {recursive: true});

    const soundtrack = path.join(root, 'public', 'audio', 'soundtrack.wav');
    if (!await exists(soundtrack)) {
      await run([path.join(root, 'tools', 'generate-audio.mjs')]);
    }

    await run([
      cli,
      'render',
      'src/index.ts',
      'FinqubeFull',
      output,
      '--codec=h264',
      '--pixel-format=yuv420p',
      '--crf=18',
      '--audio-codec=aac',
      '--audio-bitrate=192k',
      '--concurrency=2',
      ...extra,
      '--overwrite=false',
    ]);
    console.log(`Rendered: ${output}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
