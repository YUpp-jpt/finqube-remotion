import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, cancelRender, continueRender, delayRender, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CategoryCard, Dashboard, ExpenseCard, IncomeCard, InvoiceCard, PriceCard, TransactionsCard} from './components';

const DARK = '#002c1e';
const INK = '#002d20';
const LIME = '#cbff67';
const WHITE = '#fbfff6';
const FPS = 60;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.16, 1, 0.3, 1);
const mix = (t: number, times: number[], values: number[]) => interpolate(t, times, values, clamp);
const enter = (t: number, start = 0, duration = 0.35) => interpolate(t, [start, start + duration], [0, 1], {...clamp, easing: ease});

/** All visual motion is a pure function of the composition frame. */
const Background: React.FC<{light?: boolean; time: number}> = ({light = false, time}) => {
  const spots = [
    {x: 120, y: 160, w: 550, h: 460, phase: 0, color: light ? '#dff6c4' : '#315d22'},
    {x: 610, y: 455, w: 360, h: 570, phase: 2.4, color: light ? '#edffd4' : '#153f25'},
    {x: 110, y: 860, w: 460, h: 590, phase: 4, color: light ? '#e2f7c7' : '#1e5128'},
    {x: 575, y: 1130, w: 550, h: 390, phase: 1.7, color: light ? '#eeffd7' : '#274e1b'},
  ];
  return <AbsoluteFill style={{backgroundColor: light ? WHITE : DARK, overflow: 'hidden'}}>
    {spots.map((s, i) => <div key={i} style={{position: 'absolute', left: s.x - s.w / 2 + Math.sin(time * 0.45 + s.phase) * 90, top: s.y - s.h / 2 + Math.cos(time * 0.3 + s.phase) * 110, width: s.w, height: s.h, background: s.color, borderRadius: i % 2 ? '42%' : '26%', filter: 'blur(85px)', opacity: light ? 0.63 : 0.36}} />)}
  </AbsoluteFill>;
};

const CenterText: React.FC<{children: React.ReactNode; y?: number; size?: number; color?: string; style?: React.CSSProperties}> = ({children, y = 640, size = 64, color = INK, style}) => <div style={{position: 'absolute', left: 0, top: y, width: 720, textAlign: 'center', transform: 'translateY(-50%)', fontSize: size, fontWeight: 700, lineHeight: 1.04, letterSpacing: '-2.3px', color, ...style}}>{children}</div>;

const Ribbon: React.FC<{time: number; light: boolean}> = ({time, light}) => {
  const phase = time * 3.9;
  const angle = Math.sin(phase) * 90 + time * 58;
  const squash = 0.6 + 0.4 * Math.abs(Math.cos(time * 4));
  return <svg width="175" height="130" viewBox="0 0 175 130" style={{position: 'absolute', left: 434 + Math.sin(time * 5) * 12, top: 520 + Math.cos(time * 3.5) * 10, overflow: 'visible', transform: `rotate(${angle}deg) scaleY(${squash})`, filter: `drop-shadow(0 0 9px ${light ? '#cbff67' : '#d8ff50'}90)`}}>
    <path d={`M 28 88 Q ${30 + Math.cos(phase) * 20} 18 88 29 Q 135 45 132 78`} fill="none" stroke={light ? '#b9ff48' : '#d7f551'} strokeWidth="17" strokeLinecap="round" />
  </svg>;
};

const Intro: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const word = t < 1 ? 'Are You a' : t < 2 ? 'Freelancer' : 'Creator';
  const onset = t < 1 ? 0 : t < 2 ? 1 : t < 3 ? 2 : 3;
  const p = enter(t, onset, 0.18);
  return <AbsoluteFill>
    <Background light time={t} />
    <Ribbon time={t} light />
    <CenterText y={650} size={word === 'Are You a' ? 62 : 72} style={{opacity: p, transform: `translateY(calc(-50% + ${(1 - p) * 26}px))`, filter: `blur(${(1 - p) * 8}px)`}}>
      <span style={{display: 'inline-block', background: word === 'Are You a' ? 'transparent' : '#d5f8a1b0', width: word === 'Are You a' ? undefined : 420, padding: '3px 0 8px'}}>{word}</span>
    </CenterText>
  </AbsoluteFill>;
};

const FileTile: React.FC<{size?: number; flat?: boolean; table?: boolean}> = ({size = 90, flat = false, table = false}) => <div style={{width: size, height: size * (flat ? 0.65 : 1.05), borderRadius: size * 0.18, background: flat ? '#46ce90' : 'linear-gradient(135deg, #acff79 0%, #54d37d 44%, #27a764 100%)', color: '#efffe4', padding: size * 0.14, boxSizing: 'border-box', boxShadow: flat ? '0 0 15px #64ee8590' : 'inset 0 0 5px 2px #d3ffb965, 0 0 34px #9bff652f', display: 'flex', flexDirection: flat ? 'row' : 'column', alignItems: flat ? 'center' : 'flex-start', gap: size * 0.05, overflow: 'hidden'}}>
  <svg width={size * 0.24} height={size * 0.24} viewBox="0 0 24 24" style={{flexShrink: 0}}><rect x="3" y="3" width="18" height="18" fill={table ? 'none' : '#e5ffcf88'} stroke="#f6ffe5" strokeWidth="1.3" />{Array.from({length: table ? 2 : 6}, (_, i) => <line key={i} x1="5" x2="19" y1={6 + i * (table ? 6 : 2.2)} y2={6 + i * (table ? 6 : 2.2)} stroke="#f6ffe5" strokeWidth="1" />)}{table && <line x1="12" y1="3" x2="12" y2="21" stroke="#f6ffe5" />}</svg>
  {!table && <span style={{fontSize: size * (flat ? 0.3 : 0.32), fontWeight: flat ? 400 : 700, lineHeight: 1, letterSpacing: '-0.5px'}}>XLS</span>}
</div>;

const ClientMessage: React.FC<{small?: boolean}> = ({small = false}) => <div style={{width: 330, background: '#f5ffecdc', borderRadius: 13, padding: '8px 11px', boxShadow: '0 0 22px #c4ff551f', color: '#142c1e', transform: small ? 'scale(.76)' : undefined, transformOrigin: 'left top'}}>
  <div style={{fontSize: 14, fontWeight: 700}}>🟢 Client $$$</div><div style={{fontSize: 11, marginTop: 2}}>How much do I owe? &nbsp; Where is the invoice?</div>
</div>;

const Cursor: React.FC<{x: number; y: number; scale?: number; click?: number}> = ({x, y, scale = 1, click = 0}) => <div style={{position: 'absolute', left: x, top: y, transform: `scale(${scale * (1 - click * 0.14)})`, transformOrigin: 'top left', filter: 'drop-shadow(0 3px 3px #001e2570)'}}>
  {click > 0 && <div style={{position: 'absolute', left: -21, top: -21, width: 42, height: 42, borderRadius: '50%', border: `3px solid ${LIME}`, opacity: click, transform: `scale(${2 - click})`}} />}
  <svg width="35" height="51" viewBox="0 0 35 51"><path d="M3 3 L30 28 L18 30 L10 45 Z" fill={DARK} stroke="#f1fff1" strokeWidth="3" /></svg>
</div>;

const Problems: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const global = t + 3.5;
  const label = t < 1 ? 'Still Managing' : t < 2 ? 'Finances' : 'through';
  const onset = t < 1 ? 0 : t < 2 ? 1 : 2;
  const p = enter(t, onset, 0.17);
  const clutter = enter(t, 2.45, 0.4);
  const slots = [[178, 174, 82, -12], [290, 370, 98, 13], [492, 650, 100, 3], [587, 880, 70, -6], [582, 110, 53, 11], [305, 150, 27, 2], [586, 440, 37, -14], [278, 1120, 34, 14], [535, 1060, 55, -7], [710, 600, 54, 15]];
  return <AbsoluteFill>
    <Background time={global} />
    {t < 2.9 && <><Ribbon time={global} light={false} /><CenterText y={642} size={label === 'Still Managing' ? 61 : 64} color="#fbfff5" style={{opacity: p * (1 - enter(t, 2.58, 0.27)), filter: `blur(${(1 - p) * 6}px)`}}>{label}</CenterText></>}
    <AbsoluteFill style={{opacity: clutter, transform: `translateY(${(1 - clutter) * 270 - Math.max(0, t - 2.6) * 150}px)`}}>
      {slots.map(([x, y, size, angle], i) => <div key={i} style={{position: 'absolute', left: x + Math.sin(t * 0.8 + i) * 18, top: y + Math.sin(t * 1.2 + i * 2) * 22, transform: `perspective(650px) rotateY(${Math.sin(t + i) * 17}deg) rotate(${angle + Math.sin(t + i) * 4}deg)`}}><FileTile size={size} table={i % 3 === 1} /></div>)}
      {[[-16, -10], [91, 1160], [20, 805], [104, 965]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x + Math.sin(t + i) * 20, top: y, transform: `rotate(${i % 2 ? -3 : 3}deg)`}}><ClientMessage small={i > 1} /></div>)}
    </AbsoluteFill>
  </AbsoluteFill>;
};

const Funnel: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const label = t < 1.6 ? 'Payments' : t < 3.1 ? 'Expenses' : 'Where is my Money?';
  const onset = t < 1.6 ? 0 : t < 3.1 ? 1.6 : t < 3.2 ? 3.0 : 3.2;
  const p = enter(t, onset, 0.17);
  const tiles = [[80, 925, 65, 10], [130, 907, 95, 93], [209, 1001, 100, 28], [256, 1086, 75, -65], [324, 1042, 96, 36], [397, 1130, 90, -60], [485, 1110, 65, -18], [540, 1210, 96, -36], [629, 1170, 90, -97], [655, 870, 70, -23], [315, 958, 61, 71], [703, 1080, 72, 92]];
  return <AbsoluteFill>
    <Background time={t + 8} />
    <svg width="720" height="1280" style={{position: 'absolute', transform: `perspective(1600px) rotateZ(${mix(t, [0, 4], [1.5, -1])}deg)`, transformOrigin: 'center center'}}><path d="M20 22 L705 35 L705 258 L499 448 L499 1212 L263 1212 L263 448 L20 232 Z" fill="#8aac8c" opacity="0.23" /></svg>
    <div style={{position: 'absolute', left: 0, top: 930, width: 720, height: 380, background: '#c9ff69', borderRadius: '50% 50% 12% 12%', filter: 'blur(26px)', boxShadow: '0 0 75px #caff7c', transform: 'rotate(-2deg)'}} />
    {tiles.map(([x, y, size, a], i) => <div key={i} style={{position: 'absolute', left: x + Math.sin(t * 1.5 + i) * 28, top: y + Math.cos(t * 1.6 + i * 1.7) * 20 - enter(t, i * 0.035, 0.5) * (i % 3 === 0 ? 40 : 0), transform: `rotate(${a + Math.sin(t + i) * 13}deg)`}}><FileTile size={size} flat /></div>)}
    <CenterText y={532} size={label === 'Where is my Money?' ? 48 : 66} color="#fbfff5" style={{opacity: p, width: label === 'Where is my Money?' ? 390 : 720, left: label === 'Where is my Money?' ? 165 : 0, transform: `translateY(-50%) rotate(${label === 'Payments' ? -7 : label === 'Expenses' ? -3 : 0}deg) scale(${0.9 + p * 0.1})`, lineHeight: 1.25}}>{label === 'Where is my Money?' ? <>Where is <span style={{fontSize: 34, opacity: t < 3.2 ? 1 : enter(t, 3.45, 0.15)}}>my</span><br /><span style={{opacity: t < 3.2 ? 1 : enter(t, 3.68, 0.15)}}>Money?</span></> : label}</CenterText>
    <Cursor x={mix(t, [0, 1.5, 3.2, 4], [248, 378, 373, 396])} y={mix(t, [0, 1.5, 3.2, 4], [1050, 995, 1015, 1010])} scale={0.9} />
  </AbsoluteFill>;
};

const Hero: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const p = enter(t, 0, 0.6);
  const slide = enter(t, 2.0, 0.65);
  return <AbsoluteFill>
    <Background light time={t + 12} />
    <div style={{position: 'absolute', left: 484 + (1 - slide) * 320, top: 520, width: 236, color: INK, fontSize: 48, fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.03, opacity: slide}}>AI Powered<br />Finance<br />Manager</div>
    <div style={{position: 'absolute', left: 18 + (1 - p) * 316 - slide * 250, top: 450 + (1 - p) * 170, transform: `perspective(1800px) rotateY(${mix(t, [0, 1.5, 3.8], [-13, 2, -5])}deg) rotateZ(${mix(t, [0, 3.8], [1.5, -1])}deg) scale(${0.64 * (0.08 + p * 0.92)})`, transformOrigin: 'top left', filter: 'drop-shadow(0 30px 30px #23410d32)'}}><Dashboard progress={p} /></div>
  </AbsoluteFill>;
};

const Orbit: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const p = enter(t, 0.08, 0.7);
  const dots = [
    {r: 175, a: 0.3, name: 'Freelancer', size: 45}, {r: 188, a: 3.15, name: 'Freelancer', size: 40},
    {r: 276, a: -1.77, name: 'Creator', size: 48}, {r: 287, a: 1.32, name: 'Freelancer', size: 51}, {r: 289, a: 2.15, name: 'Freelancer', size: 53}, {r: 282, a: 3.7, name: 'Creator', size: 46},
    {r: 395, a: -1.33, name: 'Consultant', size: 59}, {r: 394, a: -0.25, name: 'Consultant', size: 63}, {r: 394, a: 0.64, name: 'Consultant', size: 63}, {r: 392, a: 2.82, name: 'Creator', size: 53},
  ];
  return <AbsoluteFill>
    <Background time={t + 15.8} />
    {[175, 287, 397].map(r => <div key={r} style={{position: 'absolute', left: 360 - r, top: 640 - r, width: r * 2, height: r * 2, border: '1px dashed #b5d28328', borderRadius: '50%', transform: `scale(${0.8 + p * 0.2})`, opacity: p}} />)}
    {dots.map((d, i) => {
      const a = d.a + t * 0.10;
      const x = 360 + Math.cos(a) * d.r;
      const y = 640 + Math.sin(a) * d.r;
      return <div key={i} style={{position: 'absolute', left: x - d.size / 2, top: y - d.size / 2, width: d.size, opacity: enter(t, i * 0.028, 0.4), transform: `scale(${0.65 + p * 0.35})`}}>
        <div style={{width: d.size, height: d.size, boxSizing: 'border-box', borderRadius: '50%', background: 'radial-gradient(circle at 35% 28%,#e6f9ba,#bcdf72 77%,#abce62)', border: `${d.size * 0.2}px solid #fcfff9`, boxShadow: '0 0 24px #d1ffc82d'}} />
        <div style={{position: 'absolute', top: d.size + 7, left: -30, width: d.size + 60, textAlign: 'center', color: '#fbfff5', fontSize: 12, letterSpacing: '-0.5px'}}>{d.name}</div>
      </div>;
    })}
    <CenterText y={640} size={64} color={LIME} style={{opacity: p}}>Built For</CenterText>
  </AbsoluteFill>;
};

const Floating: React.FC<{x: number; y: number; scale: number; rotation?: number; time: number; children: React.ReactNode; phase?: number}> = ({x, y, scale, rotation = 0, time, children, phase = 0}) => <div style={{position: 'absolute', left: x + Math.sin(time * 0.55 + phase) * 11, top: y + Math.sin(time * 0.7 + phase) * 12, transform: `perspective(1500px) rotateY(${Math.sin(time * 0.5 + phase) * 6}deg) rotateZ(${rotation + Math.sin(time * 0.5 + phase) * 1.5}deg) scale(${scale})`, transformOrigin: 'top left'}}>{children}</div>;

/** Persistent card positions form a single plane; the camera visits each feature. */
const CardBoard: React.FC<{time: number; spread?: number}> = ({time, spread = 1}) => <>
  <Floating x={48 - (spread - 1) * 140} y={210} scale={0.54} rotation={4} time={time} phase={1}><ExpenseCard /></Floating>
  <Floating x={310 + (spread - 1) * 250} y={180} scale={0.58} rotation={-1.5} time={time} phase={3}><IncomeCard /></Floating>
  <Floating x={-106 - (spread - 1) * 150} y={705 + (spread - 1) * 80} scale={0.65} rotation={-3} time={time} phase={2}><TransactionsCard /></Floating>
  <Floating x={344 + (spread - 1) * 90} y={815 + (spread - 1) * 250} scale={0.54} rotation={-4} time={time} phase={4}><InvoiceCard /></Floating>
  <Floating x={651 + (spread - 1) * 60} y={546} scale={0.53} rotation={3} time={time} phase={5}><CategoryCard /></Floating>
  <Floating x={652 + (spread - 1) * 60} y={675} scale={0.32} rotation={-4} time={time} phase={6}><IncomeCard /></Floating>
</>;

const PeripheralCards: React.FC<{time: number; workspace?: boolean}> = ({time, workspace = false}) => <>
  <Floating x={workspace ? 200 : 232} y={workspace ? 214 : 186} scale={workspace ? 0.2 : 0.3} rotation={2} time={time} phase={1}><ExpenseCard /></Floating>
  <Floating x={workspace ? 535 : 578} y={workspace ? 168 : 196} scale={workspace ? 0.41 : 0.51} rotation={-2} time={time} phase={3}><IncomeCard /></Floating>
  <Floating x={workspace ? 56 : -18} y={workspace ? 944 : 916} scale={workspace ? 0.28 : 0.45} rotation={-5} time={time} phase={2}><TransactionsCard /></Floating>
  <Floating x={workspace ? 422 : 353} y={workspace ? 1067 : 1040} scale={workspace ? 0.34 : 0.47} rotation={-6} time={time} phase={4}><InvoiceCard /></Floating>
  {!workspace && <Floating x={620} y={667} scale={0.33} rotation={-3} time={time} phase={6}><IncomeCard /></Floating>}
  {workspace && <Floating x={655} y={665} scale={0.24} rotation={3} time={time} phase={5}><CategoryCard /></Floating>}
</>;

const Features: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const points = [0, 0.45, 1.1, 1.65, 2.1, 2.65, 3.05, 3.65, 4.25, 5.3, 6];
  const scale = mix(t, points, [1, 1.15, 1.90, 1.90, 2, 2, 2.05, 2.05, 1, 1, 1]);
  const x = mix(t, points, [0, -150, -565, -565, -695, -695, 270, 270, 0, 0, 0]);
  const y = mix(t, points, [0, -30, 102, 102, -1319, -1319, -1090, -1090, 0, 0, 0]);
  let title: React.ReactNode = null;
  let titleY = 362;
  let titleSize = 59;
  let opacity = 1;
  if (t >= 0.62 && t < 1.9) {title = 'Track Income'; opacity = enter(t, 0.62, 0.2) * (1 - enter(t, 1.69, 0.18));}
  if (t >= 1.9 && t < 2.93) {title = <>Manage<br /><span style={{display: 'inline-block', marginLeft: 190}}>Invoices</span></>; titleY = 260; opacity = enter(t, 1.9, 0.18) * (1 - enter(t, 2.72, 0.18));}
  if (t >= 2.93 && t < 4.1) {title = <>Organize<br />Transactions</>; titleY = 275; titleSize = 55; opacity = enter(t, 2.93, 0.16) * (1 - enter(t, 3.9, 0.15));}
  if (t >= 4.65) {title = <>Understand<br />Business</>; titleY = 628; titleSize = 57; opacity = enter(t, 4.65, 0.24);}
  return <AbsoluteFill>
    <Background time={t + 19} />
    {title && t < 2.93 && <CenterText y={titleY} size={titleSize} color={LIME} style={{opacity, textShadow: '0 0 17px #c9ff6760', lineHeight: 1.15}}>{title}</CenterText>}
    <AbsoluteFill style={{transform: `translate(${x}px,${y}px) scale(${scale})`, transformOrigin: 'top left'}}><CardBoard time={t + 19} /></AbsoluteFill>
    {title && t >= 2.93 && <CenterText y={titleY} size={titleSize} color={LIME} style={{opacity, textShadow: '0 0 17px #c9ff6760', lineHeight: 1.15}}>{title}</CenterText>}
  </AbsoluteFill>;
};

const Workspace: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const p = enter(t, 0, 0.6);
  return <AbsoluteFill>
    <Background time={t + 25} />
    <PeripheralCards time={t + 25} workspace />
    <CenterText y={401} size={64} color="#fff" style={{opacity: p}}>Simple</CenterText>
    <div style={{position: 'absolute', left: 35, top: 480 + (1 - p) * 130, opacity: p, transform: `perspective(1500px) rotateY(${mix(t, [0, 2.5], [-5, 2])}deg) rotateZ(${Math.sin(t) * 0.6}deg) scale(.62)`, transformOrigin: 'top left'}}><Dashboard light /></div>
    <CenterText y={985} size={63} color="#fff" style={{opacity: enter(t, 0.16, 0.4)}}>Workspace</CenterText>
  </AbsoluteFill>;
};

const BestPart: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const p = enter(t, 0, 0.42);
  const tags = [{text: 'Invoices', x: 55, y: 259}, {text: 'Transactions', x: 277, y: 315}, {text: 'Charts', x: 500, y: 358}, {text: 'Expenses', x: 52, y: 1068}, {text: 'AI Tools', x: 277, y: 1108}, {text: 'Dark Mode', x: 501, y: 1170}];
  return <AbsoluteFill>
    <Background light time={t + 27.5} />
    {tags.map((tag, i) => <div key={tag.text} style={{position: 'absolute', left: tag.x + Math.sin(t * 1.4 + i) * 8, top: tag.y + Math.cos(t + i) * 8, color: '#769041', background: '#dff3b9b0', padding: '4px 13px', fontSize: 16, opacity: enter(t, i * 0.03, 0.3)}}>{tag.text}</div>)}
    <div style={{position: 'absolute', left: 80, top: 546 + (1 - p) * 70, transform: 'scale(.563)', transformOrigin: 'top left', filter: 'drop-shadow(0 28px 24px #31501435)'}}><Dashboard /></div>
    <CenterText y={1050} size={63} style={{opacity: p}}>The Best Part?</CenterText>
  </AbsoluteFill>;
};

/** Small original vector emoji keep every frame independent of OS emoji fonts. */
const Emoji: React.FC<{kind: number}> = ({kind}) => {
  if (kind % 4 === 1) return <svg width="47" height="54" viewBox="0 0 47 54"><defs><radialGradient id="flame"><stop stopColor="#fff881" /><stop offset=".6" stopColor="#ffc328" /><stop offset="1" stopColor="#ef4f1d" /></radialGradient></defs><path d="M27 2 Q43 20 37 29 Q45 23 44 18 Q52 50 26 53 Q1 51 6 31 Q8 24 10 18 Q13 31 16 31 Q21 18 27 2" fill="url(#flame)" /><path d="M25 25 Q38 42 26 51 Q13 46 20 38 Z" fill="#fff894" /></svg>;
  return <svg width="47" height="49" viewBox="0 0 48 50"><defs><radialGradient id={`face${kind}`} cx="35%" cy="30%" r="72%"><stop stopColor="#fff48a" /><stop offset=".6" stopColor="#ffce40" /><stop offset="1" stopColor="#e89317" /></radialGradient></defs><circle cx="24" cy="25" r="21" fill={`url(#face${kind})`} stroke="#e7a223" strokeWidth="1" />
    {kind % 4 === 0 ? <><path d="M4 17 L22 18 L24 19 L27 18 L43 17 L40 28 Q32 34 27 24 L23 23 Q17 34 8 28 Z" fill="#152220" /><path d="M9 19 L18 20 L11 24 Z M29 20 L39 19 L31 24 Z" fill="#607d7e" /><path d="M14 34 Q26 45 36 33 Q25 48 14 34" fill="#602d13" /></> : kind % 4 === 2 ? <><text x="8" y="25" fontSize="17" fontWeight="700" fill="#785622">$</text><text x="26" y="25" fontSize="17" fontWeight="700" fill="#785622">$</text><path d="M13 33 Q23 41 36 31" fill="none" stroke="#68461d" strokeWidth="3" strokeLinecap="round" /><rect x="23" y="34" width="14" height="15" rx="2" fill="#42a658" transform="rotate(14 23 34)" /><path d="M28 36 L30 46" stroke="#b7e98d" strokeWidth="3" /></> : <><ellipse cx="16" cy="22" rx="3" ry="5" fill="#6f4419" /><ellipse cx="32" cy="22" rx="3" ry="5" fill="#6f4419" /><path d="M10 13 Q16 9 21 13 M27 13 Q32 9 38 14" fill="none" stroke="#8d621e" strokeWidth="2" /><ellipse cx="24" cy="36" rx="5" ry="7" fill="#704015" /></>}
  </svg>;
};

const Free: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const poses = [[50, 160], [242, 180], [432, 210], [228, 448], [414, 470], [600, 492], [84, 760], [396, 743], [582, 760], [64, 1045], [262, 1060], [565, 1020], [76, 1310], [624, 100], [614, 1285]];
  const upgrade = t >= 2;
  const p = enter(t, upgrade ? 2 : 0, 0.25);
  return <AbsoluteFill>
    <Background light time={t + 29} />
    {poses.map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x - 24 + Math.sin(t * 0.5 + i) * 13, top: y - 25 + Math.sin(t * 0.8 + i) * 15, transform: `rotate(${Math.sin(t + i) * 15}deg) scale(${0.81 + (i % 3) * 0.1})`}}><Emoji kind={i % 4} /></div>)}
    <CenterText y={649} size={66} style={{opacity: p, transform: `translateY(-50%) scale(${0.91 + p * 0.09})`, lineHeight: 0.98}}>{upgrade ? <>Until You<br />Wanna<br />Upgrade</> : <>Completely<br />FREE!!<br /><span style={{fontSize: 45, lineHeight: 1.2}}>to</span><br />Start</>}</CenterText>
  </AbsoluteFill>;
};

const Pricing: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const price = enter(t, 3, 0.45);
  const sentence = 'no monthly Subscription';
  const letters = Math.floor(mix(t, [4 / 3, 2.35], [0, sentence.length]));
  const click = Math.max(0, 1 - Math.abs(t - 4.0) / 0.18);
  return <AbsoluteFill>
    <Background time={t + 32} />
    <PeripheralCards time={t + 32} />
    {t < 3 && <CenterText y={640} size={t < 4 / 3 ? 60 : 46} color={LIME} style={{opacity: t < 4 / 3 ? enter(t, 0, 0.2) : 1, letterSpacing: '-1.7px'}}>{t < 4 / 3 ? 'That too at' : sentence.slice(0, letters)}</CenterText>}
    <div style={{position: 'absolute', left: 181, top: 390 + (1 - price) * 930, opacity: price, transform: `perspective(1300px) rotateY(${mix(t, [2.8, 4.5], [-7, 1])}deg) rotateZ(${mix(t, [2.8, 4.5], [-2, 0.5])}deg) scale(1.055)`, transformOrigin: 'top left', filter: 'drop-shadow(0 18px 20px #001f1620)'}}><PriceCard /></div>
    {t > 2.7 && <Cursor x={mix(t, [2.7, 3.6, 4, 4.5], [615, 435, 360, 435])} y={mix(t, [2.7, 3.6, 4, 4.5], [1110, 924, 763, 930])} scale={1} click={click} />}
  </AbsoluteFill>;
};

const Lifetime: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const p = enter(t, 0.1, 0.35);
  return <AbsoluteFill>
    <Background light time={t + 36.5} />
    <AbsoluteFill style={{filter: 'drop-shadow(0 8px 10px #2b3c2520)'}}><PeripheralCards time={t + 36.5} /></AbsoluteFill>
    <CenterText y={647} size={63} style={{opacity: p, lineHeight: 1.08}}><span style={{display: 'block', fontSize: 50, marginBottom: 22}}>∞</span>Lifetime<br />Access</CenterText>
  </AbsoluteFill>;
};

const Waitlist: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const p = enter(t, 0, 0.5);
  return <AbsoluteFill>
    <Background light time={t + 38.6667} />
    <div style={{position: 'absolute', left: 14, top: 10, width: 692, height: 1245, backgroundColor: '#fff', transform: `perspective(2200px) rotateY(${(1 - p) * -5 + Math.sin(t * 0.7) * 0.15}deg) rotateZ(${(1 - p) * -0.8}deg) scale(${0.98 + p * 0.02})`, transformOrigin: '50% 50%', boxShadow: '0 0 32px #d9fbac50'}}>
      <div style={{position: 'absolute', left: 0, top: 109, width: 692, display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center', color: '#050b07', fontWeight: 700, fontSize: 45, letterSpacing: '-1.3px'}}><svg width="27" height="38" viewBox="0 0 27 38"><path d="M15 2 L7 19 L24 19 L14 36" fill="none" stroke="#d1f696" strokeWidth="5" strokeLinejoin="round" /></svg>finqube</div>
      <div style={{position: 'absolute', left: 0, top: 381, width: 692, textAlign: 'center', color: INK, fontWeight: 700, fontSize: 57, letterSpacing: '-2.4px'}}>Join the Waitlist</div>
      <div style={{position: 'absolute', left: 32, top: 486 + Math.sin(t * 0.55) * 2, transform: `perspective(1800px) rotateY(${mix(t, [0, 1, 6.7], [-3, 1, 0])}deg) rotateZ(.35deg) scale(.625)`, transformOrigin: 'top left', filter: 'drop-shadow(0 25px 27px #1b2b173d)'}}><Dashboard /></div>
      <div style={{position: 'absolute', left: 0, top: 978, width: 692, textAlign: 'center', color: '#545c52', fontSize: 25, letterSpacing: '-0.4px'}}>www.finqube.one</div>
      <div style={{position: 'absolute', left: 244, top: 1032, width: 198, height: 67, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: DARK, color: '#fff', fontSize: 30, letterSpacing: '-0.7px'}}>Join Now</div>
    </div>
  </AbsoluteFill>;
};

export const SCENES = [
  {id: 'question', from: 0, to: 210, component: Intro},
  {id: 'spreadsheet-chaos', from: 210, to: 480, component: Problems},
  {id: 'payments-funnel', from: 480, to: 720, component: Funnel},
  {id: 'dashboard-introduction', from: 720, to: 948, component: Hero},
  {id: 'built-for-orbits', from: 948, to: 1140, component: Orbit},
  {id: 'feature-card-camera', from: 1140, to: 1500, component: Features},
  {id: 'simple-workspace', from: 1500, to: 1650, component: Workspace},
  {id: 'the-best-part', from: 1650, to: 1740, component: BestPart},
  {id: 'free-and-upgrade', from: 1740, to: 1920, component: Free},
  {id: 'single-payment', from: 1920, to: 2190, component: Pricing},
  {id: 'lifetime-access', from: 2190, to: 2320, component: Lifetime},
  {id: 'waitlist-end-card', from: 2320, to: 2722, component: Waitlist},
] as const;

export const Finqube: React.FC = () => {
  const {durationInFrames} = useVideoConfig();
  const [fontHandle] = useState(() => delayRender('Load bundled Arimo font'));
  useEffect(() => {
    const face = new FontFace('Finqube Sans', `url("${staticFile('fonts/Arimo.ttf')}")`, {weight: '100 900'});
    face.load().then(font => {document.fonts.add(font); continueRender(fontHandle);}).catch(cancelRender);
  }, [fontHandle]);
  return <AbsoluteFill style={{fontFamily: '"Finqube Sans", Arial, sans-serif', overflow: 'hidden'}}>
    {SCENES.map(({id, from, to, component: Component}) => <Sequence key={id} from={from} durationInFrames={to - from} name={id}><Component /></Sequence>)}
    <Audio src={staticFile('audio/soundtrack.wav')} endAt={durationInFrames} volume={0.86} />
  </AbsoluteFill>;
};
