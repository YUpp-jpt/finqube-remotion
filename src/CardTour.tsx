import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame} from 'remotion';
import {CARD_SIZE, CategoryCard, ExpenseCard, IncomeCard, InvoiceCard, TransactionsCard} from './components';

type Vector = {x: number; y: number; z: number};
type Angles = {pitch: number; yaw: number; roll: number};
type Camera = Vector & Angles;
type Plane = {
  id: string;
  position: Vector;
  endingPosition: Vector;
  angle: Angles;
  endingAngle?: Angles;
  width: number;
  height: number;
  nativeWidth: number;
  nativeHeight: number;
  component: React.FC;
};

const WIDTH = 720;
const HEIGHT = 1280;
const FOCAL_LENGTH = 760;
const radians = (degrees: number) => degrees * Math.PI / 180;
const bound = (n: number) => Math.max(0, Math.min(1, n));
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const smoother = (n: number) => {
  const u = bound(n);
  return u * u * u * (10 + u * (-15 + 6 * u));
};
// A slightly early velocity peak gives the cross-frame moves a long braking tail.
const travel = (n: number) => {
  const u = bound(n);
  return smoother(u + 0.35 * u * (1 - u));
};

const add = (a: Vector, b: Vector): Vector => ({x: a.x + b.x, y: a.y + b.y, z: a.z + b.z});
const multiply = (v: Vector, k: number): Vector => ({x: v.x * k, y: v.y * k, z: v.z * k});
const blendVector = (a: Vector, b: Vector, t: number): Vector => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t)});

const rotate = (v: Vector, angle: Angles): Vector => {
  const rx = radians(angle.pitch), ry = radians(angle.yaw), rz = radians(angle.roll);
  const a = {x: v.x, y: v.y * Math.cos(rx) - v.z * Math.sin(rx), z: v.y * Math.sin(rx) + v.z * Math.cos(rx)};
  const b = {x: a.x * Math.cos(ry) + a.z * Math.sin(ry), y: a.y, z: -a.x * Math.sin(ry) + a.z * Math.cos(ry)};
  return {x: b.x * Math.cos(rz) - b.y * Math.sin(rz), y: b.x * Math.sin(rz) + b.y * Math.cos(rz), z: b.z};
};

const opening: Camera = {x: 15, y: -20, z: 1400, pitch: 2, yaw: 2, roll: 0};
const destinations: {from: number; to: number; pose: Camera; bank: Angles}[] = [
  {from: 32, to: 76, pose: {x: 210, y: -518, z: 940, pitch: 2, yaw: -2, roll: -5}, bank: {pitch: 3, yaw: -5, roll: -4}},
  {from: 112, to: 151, pose: {x: 260, y: 450, z: 680, pitch: -3, yaw: -3, roll: 5}, bank: {pitch: -4, yaw: 8, roll: 4}},
  {from: 180, to: 219, pose: {x: -463, y: 420, z: 880, pitch: -3, yaw: 2, roll: -2}, bank: {pitch: 3, yaw: -5, roll: -4}},
  {from: 245, to: 296, pose: {x: 0, y: 0, z: 1630, pitch: 0, yaw: 0, roll: 0}, bank: {pitch: 2, yaw: 5, roll: 2}},
];
const cameraKeys = ['x', 'y', 'z', 'pitch', 'yaw', 'roll'] as const;
const phase = {x: 0, y: 3, z: -2, pitch: 4, yaw: 2, roll: 1};

export const cameraAt = (frame: number): Camera => {
  const camera = {...opening};
  let previous = opening;
  for (const move of destinations) {
    for (const key of cameraKeys) {
      camera[key] += (move.pose[key] - previous[key]) * travel((frame - move.from - phase[key]) / (move.to - move.from));
    }
    const u = bound((frame - move.from) / (move.to - move.from));
    const bank = Math.sin(Math.PI * u) ** 3;
    camera.pitch += move.bank.pitch * bank;
    camera.yaw += move.bank.yaw * bank;
    camera.roll += move.bank.roll * bank;
    previous = move.pose;
  }
  camera.x += Math.sin(frame * 0.013) * 1.3;
  camera.y += Math.sin(frame * 0.011 + 0.5) * 1.4;
  camera.yaw += Math.sin(frame * 0.017) * 0.23;
  return camera;
};

export const cameraSpeed = (frame: number): number => {
  const before = cameraAt(frame - 0.5), after = cameraAt(frame + 0.5);
  return Math.hypot(after.x - before.x, after.y - before.y, after.z - before.z);
};

const cardGeometry = (size: {width: number; height: number}) => ({...size, nativeWidth: size.width, nativeHeight: size.height});
const planes: Plane[] = [
  {id: 'expense', position: {x: -700, y: -605, z: -60}, endingPosition: {x: -530, y: -500, z: -300}, angle: {pitch: -3, yaw: 15, roll: 3}, ...cardGeometry(CARD_SIZE.expense), component: ExpenseCard},
  {id: 'income', position: {x: 200, y: -525, z: 145}, endingPosition: {x: 200, y: -520, z: 20}, angle: {pitch: 0, yaw: -5, roll: 3}, endingAngle: {pitch: 0, yaw: -4, roll: -1.2}, ...cardGeometry(CARD_SIZE.income), component: IncomeCard},
  {id: 'transactions', position: {x: -490, y: 390, z: 110}, endingPosition: {x: -580, y: 298, z: 115}, angle: {pitch: 5, yaw: -15, roll: -4}, endingAngle: {pitch: 4, yaw: -3, roll: 3}, ...cardGeometry(CARD_SIZE.transactions), component: TransactionsCard},
  {id: 'invoice', position: {x: 230, y: 460, z: -70}, endingPosition: {x: 253, y: 510, z: 40}, angle: {pitch: -5, yaw: 20, roll: -5}, endingAngle: {pitch: 0, yaw: 2, roll: 0}, ...cardGeometry(CARD_SIZE.invoice), component: InvoiceCard},
  {id: 'category', position: {x: 635, y: -105, z: 240}, endingPosition: {x: 635, y: -135, z: 240}, angle: {pitch: 3, yaw: -13, roll: 2}, ...cardGeometry(CARD_SIZE.category), component: CategoryCard},
];

const planeAt = (plane: Plane, frame: number) => {
  const reframe = smoother((frame - 247) / 51);
  const position = blendVector(plane.position, plane.endingPosition, reframe);
  // Peripheral planes ease into their new spacing as the camera passes them.
  // Their small independent translations keep the retreat composition open.
  if (plane.id === 'expense') {
    const follow = smoother((frame - 112) / 77) * (1 - reframe);
    position.x += follow * 165;
    position.y += follow * 150;
  }
  if (plane.id === 'invoice') {
    position.y += 100 * smoother((frame - 32) / 44) * (1 - smoother((frame - 112) / 39));
  }
  const endingAngle = plane.endingAngle ?? plane.angle;
  const angle = {
    pitch: lerp(plane.angle.pitch, endingAngle.pitch, reframe),
    yaw: lerp(plane.angle.yaw, endingAngle.yaw, reframe),
    roll: lerp(plane.angle.roll, endingAngle.roll, reframe),
  };
  const ordinal = planes.indexOf(plane);
  position.x += Math.sin(frame / 110 + ordinal * 1.7) * 2.5;
  position.y += Math.sin(frame / 95 + ordinal * 1.3) * 2;
  angle.yaw += Math.sin(frame / 140 + ordinal) * 0.6;
  return {position, angle};
};

const viewPoint = (point: Vector, camera: Camera): Vector => rotate({x: point.x - camera.x, y: point.y - camera.y, z: point.z}, camera);
const project = (point: Vector, camera: Camera) => {
  const v = viewPoint(point, camera);
  const scale = FOCAL_LENGTH / Math.max(70, camera.z - v.z);
  return {x: WIDTH / 2 + v.x * scale, y: HEIGHT / 2 + v.y * scale, scale, depth: camera.z - v.z};
};

/**
 * Project an actual 3D rectangle through a pinhole camera. The homogeneous
 * denominator varies over both card axes, so this includes perspective
 * foreshortening and keystone distortion rather than a scale/pan surrogate.
 */
const planeMatrix = (center: Vector, angle: Angles, width: number, height: number, camera: Camera): string => {
  const right = rotate({x: 1, y: 0, z: 0}, angle);
  const down = rotate({x: 0, y: 1, z: 0}, angle);
  const corner = add(add(center, multiply(right, -width / 2)), multiply(down, -height / 2));
  const origin = viewPoint(corner, camera);
  const horizontal = rotate(right, camera);
  const vertical = rotate(down, camera);
  const distance = camera.z - origin.z;
  const cx = WIDTH / 2, cy = HEIGHT / 2, f = FOCAL_LENGTH;
  const matrix = [
    (f * horizontal.x - cx * horizontal.z) / distance,
    (f * horizontal.y - cy * horizontal.z) / distance,
    0, -horizontal.z / distance,
    (f * vertical.x - cx * vertical.z) / distance,
    (f * vertical.y - cy * vertical.z) / distance,
    0, -vertical.z / distance,
    0, 0, 1, 0,
    cx + f * origin.x / distance,
    cy + f * origin.y / distance,
    0, 1,
  ];
  return `matrix3d(${matrix.join(',')})`;
};

const blurAt = (plane: Plane, frame: number) => {
  const earlier = planeAt(plane, frame - 0.5);
  const later = planeAt(plane, frame + 0.5);
  const a = project(earlier.position, cameraAt(frame - 0.5));
  const b = project(later.position, cameraAt(frame + 0.5));
  const scale = Math.max(0.45, (a.scale + b.scale) / 2);
  const zoom = Math.abs(b.scale - a.scale) * Math.max(plane.width, plane.height) / 3;
  return {
    x: Math.min(10, (Math.abs(b.x - a.x) * 0.14 + zoom * 0.18) / scale),
    y: Math.min(13, (Math.abs(b.y - a.y) * 0.14 + zoom * 0.18) / scale),
  };
};

type TitleSpec = {id: string; text: string; start: number; end: number; size: number; gap: number};
const titles: TitleSpec[] = [
  {id: 'income', text: 'Track Income', start: 62, end: 121, size: 54, gap: 80},
  {id: 'invoice', text: 'Manage Invoices', start: 141, end: 188, size: 52, gap: 66},
  {id: 'transactions', text: 'Organize Transactions', start: 207, end: 254, size: 50, gap: 59},
];

const Words: React.FC<{text: string; frame: number; start: number; end: number; size: number}> = ({text, frame, start, end, size}) => {
  if (frame < start || frame >= end) return null;
  const fade = 1 - smoother((frame - end + 5) / 5);
  const lines = text.split('\n');
  let ordinal = 0;
  return <div style={{width: '100%', color: '#d9ff83', textAlign: 'center', fontWeight: 700, fontSize: size, lineHeight: 1.24, letterSpacing: -1.5, whiteSpace: 'nowrap', opacity: fade, textShadow: '0 0 3px #eaff9b, 0 0 17px #c4ff6890, 0 0 32px #c4ff6840'}}>
    {lines.map((line, lineIndex) => <div key={lineIndex}>{line.split(' ').map((word, index) => {
      const local = frame - start - ordinal++ * 4;
      const p = spring({frame: Math.max(0, local), fps: 60, config: {mass: 0.65, damping: 16, stiffness: 180}});
      return <span key={index} style={{display: 'inline-block', visibility: local < 0 ? 'hidden' : 'visible', marginRight: index < line.split(' ').length - 1 ? size * 0.26 : 0, transformOrigin: 'center bottom', transform: `translateY(${(1 - p) * 42}px) rotate(${(1 - p) * -4}deg) scaleY(${0.78 + p * 0.22})`}}>{word}</span>;
    })}</div>)}
  </div>;
};

/** Local frames 0–359, 60 fps, 720 × 1280. Background is supplied by the film. */
export const CardTourWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = cameraAt(frame);
  const ordered = planes.map(plane => ({plane, geometry: planeAt(plane, frame)})).sort((a, b) => project(b.geometry.position, camera).depth - project(a.geometry.position, camera).depth);
  const dash = smoother((frame - 28) / 33);
  const dashFade = 1 - smoother((frame - 62) / 12);
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <svg width="0" height="0" style={{position: 'absolute'}} aria-hidden="true"><defs>
      {planes.map(plane => {
        const blur = blurAt(plane, frame);
        return <filter key={plane.id} id={`finqube-tour-blur-${plane.id}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={`${blur.x} ${blur.y}`}/></filter>;
      })}
    </defs></svg>
    <AbsoluteFill>
      {ordered.map(({plane, geometry}) => {
        const Component = plane.component;
        const title = titles.find(item => item.id === plane.id);
        const titleCenter = add(geometry.position, rotate({x: plane.id === 'transactions' ? -7 : 0, y: -plane.height / 2 - (title?.gap ?? 70), z: 4}, geometry.angle));
        return <React.Fragment key={plane.id}>
          <div style={{position: 'absolute', left: 0, top: 0, width: plane.width, height: plane.height, transformOrigin: '0 0', transform: planeMatrix(geometry.position, geometry.angle, plane.width, plane.height, camera)}}>
            <div style={{width: plane.nativeWidth, height: plane.nativeHeight, transformOrigin: '0 0', transform: `scale(${plane.width / plane.nativeWidth}, ${plane.height / plane.nativeHeight})`, filter: `url(#finqube-tour-blur-${plane.id})`, boxShadow: '0 10px 35px #001b181c', borderRadius: 25}}><Component/></div>
          </div>
          {title && <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 86, display: 'flex', alignItems: 'center', transformOrigin: '0 0', transform: planeMatrix(titleCenter, geometry.angle, 960, 86, camera)}}><Words text={title.text} frame={frame} start={title.start} end={title.end} size={title.size}/></div>}
        </React.Fragment>;
      })}
      {frame >= 274 && <div style={{position: 'absolute', left: 0, top: 0, width: 900, height: 246, display: 'flex', alignItems: 'center', transformOrigin: '0 0', transform: planeMatrix({x: -10, y: -28, z: 100}, {pitch: 0, yaw: 0, roll: 0}, 900, 246, camera)}}><Words text={'Understand\nBusiness'} frame={frame} start={274} end={400} size={88}/></div>}
      {frame < 74 && <div style={{position: 'absolute', left: lerp(92 + frame * 4.2, 568, dash), top: lerp(400 + frame * 2.2, 243, dash), width: lerp(82, 58, dash), height: lerp(25, 17, dash), borderRadius: 30, opacity: dashFade, background: '#e1ff58', boxShadow: '0 0 13px #efff8f, 0 0 34px #c6ff4cc0', transform: `rotate(${lerp(15 + frame * 0.35, 29, dash)}deg)`}}/>}
    </AbsoluteFill>
  </AbsoluteFill>;
};

export const CardTour = CardTourWorld;
