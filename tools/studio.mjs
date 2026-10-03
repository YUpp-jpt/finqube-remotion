import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareCardTour} from './prepare-card-tour.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cli = path.join(path.dirname(require.resolve('@remotion/cli/package.json')), 'remotion-cli.js');
const args = process.argv.slice(2).filter(arg => arg !== '--');
const rendererArgs = args.filter(argument => /^--(browser-executable|gl|log|chromium-flags)=/.test(argument));
try {
  await prepareCardTour(rendererArgs);
  const child = spawn(process.execPath, [cli, 'studio', 'src/index.ts', ...args], {cwd:root,stdio:'inherit',windowsHide:true});
  child.once('exit', code => {process.exitCode = code ?? 1;});
} catch (error) {console.error(error.message); process.exitCode = 1;}
