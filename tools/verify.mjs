import {spawnSync} from 'node:child_process';
import {access, mkdir, writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const cli = path.join(path.dirname(require.resolve('@remotion/cli/package.json')), 'remotion-cli.js');
const ffmpeg = require('ffmpeg-static');
const expected = {width: 720, height: 1280, fps: 60, frames: 2722, duration: 2722 / 60};

const run = (binary, args) => {
  const result = spawnSync(binary, args, {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Media check failed (${result.status}): ${result.stderr || result.stdout}`);
  return result.stdout;
};

const rate = (value) => {
  const [numerator, denominator = 1] = String(value).split('/').map(Number);
  return numerator / denominator;
};

try {
  const args = process.argv.slice(2).filter((value) => value !== '--');
  if (args.includes('--help') || args.includes('-h')) {
    console.log('pnpm run verify [--input path/to/video.mp4] [--report path/to/report.json]\nDefault input: renders/finqube.mp4. Checks video dimensions, frame rate, frame count, duration, and complete media decoding.');
  } else {
    const opts = {};
    for (let i = 0; i < args.length; i += 2) {
      if (!['--input', '--report'].includes(args[i]) || !args[i + 1]) throw new Error('Use --input path and optional --report path.');
      opts[args[i].slice(2)] = args[i + 1];
    }
    const input = path.resolve(root, opts.input ?? 'renders/finqube.mp4');
    await access(input);
    const media = JSON.parse(run(process.execPath, [
      cli, 'ffprobe', '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', input,
    ]));
    const video = media.streams?.find((stream) => stream.codec_type === 'video');
    if (!video) throw new Error('The input has no video stream.');
    const actual = {
      width: video.width,
      height: video.height,
      fps: rate(video.avg_frame_rate),
      frames: Number(video.nb_read_frames),
      duration: Number(video.duration),
      codec: video.codec_name,
      pixelFormat: video.pix_fmt,
    };
    const failures = [];
    for (const key of ['width', 'height', 'frames']) {
      if (actual[key] !== expected[key]) failures.push(`${key}: expected ${expected[key]}, got ${actual[key]}`);
    }
    if (Math.abs(actual.fps - expected.fps) > 0.000001 || !Number.isFinite(actual.fps)) failures.push(`fps: expected 60, got ${actual.fps}`);
    if (Math.abs(actual.duration - expected.duration) > 0.002 || !Number.isFinite(actual.duration)) failures.push(`video duration: expected ${expected.duration}, got ${actual.duration}`);
    if (actual.codec !== 'h264') failures.push(`codec: expected h264, got ${actual.codec}`);
    if (actual.pixelFormat !== 'yuv420p') failures.push(`pixel format: expected yuv420p, got ${actual.pixelFormat}`);
    const audio = media.streams?.find((stream) => stream.codec_type === 'audio');
    if (!audio) failures.push('The soundtrack is missing.');
    else {
      if (audio.codec_name !== 'aac') failures.push(`audio codec: expected aac, got ${audio.codec_name}`);
      if (Number(audio.sample_rate) !== 48000 || audio.channels !== 2) failures.push('Audio must be 48 kHz stereo.');
      const soundDuration = Number(audio.duration);
      if (!Number.isFinite(soundDuration) || Math.abs(soundDuration - expected.duration) > 0.08) failures.push('Audio does not cover the full composition.');
    }
    if (failures.length) throw new Error(`The video does not match the composition:\n${failures.join('\n')}`);

    if (!ffmpeg) throw new Error('ffmpeg-static is unavailable on this platform.');
    run(ffmpeg, ['-hide_banner', '-v', 'error', '-xerror', '-i', input, '-map', '0:v:0', '-map', '0:a?', '-f', 'null', '-']);
    const report = {
      input,
      passed: true,
      completeDecode: true,
      expected,
      video: actual,
      containerDuration: Number(media.format?.duration),
      audio: audio ? {codec: audio.codec_name, duration: Number(audio.duration), sampleRate: Number(audio.sample_rate), channels: audio.channels} : null,
      manualReview: 'Parameter and decoding checks passed. Visual appearance and sound quality need playback review.',
    };
    const output = path.resolve(root, opts.report ?? 'renders/verification.json');
    await mkdir(path.dirname(output), {recursive: true});
    await writeFile(output, JSON.stringify(report, null, 2) + '\n', {encoding: 'utf8', flag: 'wx'});
    console.log(JSON.stringify(report, null, 2));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
