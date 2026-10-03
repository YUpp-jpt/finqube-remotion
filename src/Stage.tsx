import React from 'react';
import {AbsoluteFill, interpolate, spring} from 'remotion';
import {guideTrajectory} from './guide-trajectory';

export const palette = {dark: '#032d1e', ink: '#042f20', accent: '#d9ff83', pale: '#fbfff6'};
const edge = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const unit = (n: number) => Math.min(1, Math.max(0, n));
export const smooth = (n: number) => {const u = unit(n); return u * u * (3 - 2 * u);};
export const settle = (frame: number, delay = 0) => spring({frame: frame - delay, fps: 60, config: {mass: 0.85, stiffness: 135, damping: 11}});
export const map = (f: number, frames: number[], values: number[]) => interpolate(f, frames, values, edge);

export const LightField: React.FC<{frame: number; light?: boolean}> = ({frame, light = false}) => {
  const seconds = frame / 60;
  const colors = light ? ['#bbff55', '#d4ff88', '#8dcc42'] : ['#75b82a', '#48972e', '#b5d83c'];
  return <AbsoluteFill style={{background: light ? palette.pale : palette.dark, overflow: 'hidden'}}>
    {Array.from({length: 6}, (_, i) => {
      const phase = seconds * 0.75 + i * 1.9;
      const width = [380, 530, 680][i % 3];
      const height = i % 2 ? 980 : 600;
      return <div key={i} style={{position: 'absolute', left: 360 + 480 * Math.sin(phase * 0.7), top: 640 + 740 * Math.cos(phase * 0.55 + i), width, height, borderRadius: '48% 52% 64% 36%', background: `radial-gradient(ellipse, ${colors[i % 3]}, transparent 68%)`, opacity: light ? 0.52 : 0.36, filter: `blur(${[45, 65, 85][i % 3]}px)`, transform: `translate(-50%, -50%) rotate(${phase * 29}deg) scale(${0.85 + 0.2 * Math.sin(phase * 1.3)})`}} />;
    })}
    <div style={{position: 'absolute', width: 220, height: 1800, left: 220 + 650 * Math.sin(seconds * 0.83), top: -200, background: light ? '#e3ffae' : '#b9ef65', opacity: light ? 0.2 : 0.12, filter: 'blur(90px)', transform: `rotate(${25 + 22 * Math.sin(seconds * 0.4)}deg)`}} />
    <AbsoluteFill style={{background: light ? 'radial-gradient(ellipse, transparent 25%, #ffffff55)' : 'radial-gradient(ellipse, transparent 25%, #00190a66)'}} />
  </AbsoluteFill>;
};

export const SceneWorld: React.FC<{frame: number; shot: number; children: React.ReactNode}> = ({frame, shot, children}) => {
  const seconds = frame / 60;
  const incoming = 1 - settle(frame);
  const x = 18 * Math.sin(seconds / (85 / 30) + shot) + incoming * 36;
  const y = 15 * Math.cos(seconds / (95 / 30) + shot) + incoming * 65;
  const depth = -45 + Math.sin(seconds / (80 / 30)) * 20 - incoming * 190;
  const pitch = Math.sin(seconds / 3.5 + shot) * 2.3 - incoming * 8;
  const yaw = Math.sin(seconds / 3 + shot) * 5 + incoming * 13;
  const roll = Math.sin(seconds / (100 / 30)) * 0.8 - incoming * 3;
  return <div style={{position: 'absolute', inset: 0, perspective: 950, perspectiveOrigin: '50% 48%'}}>
    <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translate3d(${x}px, ${y}px, ${depth}px) rotateX(${pitch}deg) rotateY(${yaw}deg) rotateZ(${roll}deg)`}}>{children}</div>
  </div>;
};

export const Words: React.FC<{text: string; frame: number; size?: number; color?: string; glow?: boolean; style?: React.CSSProperties}> = ({text, frame, size = 64, color = palette.accent, glow = color === palette.accent, style}) => {
  let order = 0;
  return <div style={{fontSize: size, fontWeight: 650, letterSpacing: -0.045 * size, lineHeight: 1.12, textAlign: 'center', color, textShadow: glow ? '0 0 16px #d9ff8328' : undefined, ...style}}>
    {text.split('\n').map((line, row) => <div key={row}>{line.split(' ').map((word, index) => {
      const delay = index * 6 + row * 10;
      order++;
      const progress = spring({frame: frame - delay, fps: 60, config: {mass: 0.8, stiffness: 145, damping: 11}});
      return <span key={`${order}-${word}`} style={{display: 'inline-block', margin: '0 .12em', opacity: unit((frame - delay) / 6), transform: `translateY(${(1 - progress) * 85}px) rotate(${(1 - progress) * -7}deg) scale(${0.8 + progress * 0.2})`, transformOrigin: '50% 80%'}}>{word}</span>;
    })}</div>)}
  </div>;
};

function pointAt(frame: number): [number, number] {
  const data = guideTrajectory;
  let lower = 0, upper = data.length - 1;
  while (upper - lower > 1) {
    const mid = Math.floor((lower + upper) / 2);
    if (data[mid][0] <= frame) lower = mid; else upper = mid;
  }
  const a = data[lower], b = data[upper];
  const u = unit((frame - a[0]) / (b[0] - a[0]));
  return [a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

export const Guide: React.FC<{frame: number}> = ({frame}) => {
  if (frame > 368) return null;
  const [x, y] = pointAt(frame), before = pointAt(frame - 1);
  const speed = Math.hypot(x - before[0], y - before[1]) * 2;
  const angle = Math.atan2(y - before[1], x - before[0]) * 180 / Math.PI;
  const trail = Array.from({length: 17}, (_, i) => pointAt(frame - i * 0.5));
  const path = trail.map(([a, b], i) => `${i ? 'L' : 'M'}${a.toFixed(2)} ${b.toFixed(2)}`).join(' ');
  const color = frame < 210 ? '#b5ff4e' : '#efff62';
  const alpha = 1 - smooth((frame - 348) / 20);
  return <svg width="720" height="1280" viewBox="0 0 720 1280" style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: alpha, pointerEvents: 'none'}}>
    <defs><filter id="guide-soft-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" /></filter></defs>
    <g filter="url(#guide-soft-glow)" opacity=".65"><path d={path} fill="none" stroke={color} strokeWidth="17" strokeLinecap="round" /></g>
    <path d={path} fill="none" stroke={color} strokeWidth="17" strokeLinecap="round" />
    <ellipse cx={x} cy={y} rx={10 + Math.min(13, speed * 0.28)} ry={10 - Math.min(3, speed * 0.08)} fill={color} transform={`rotate(${angle} ${x} ${y})`} />
  </svg>;
};
