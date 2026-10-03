import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, cancelRender, continueRender, delayRender, Sequence, spring, staticFile, useCurrentFrame} from 'remotion';
import {CARD_SIZE, CategoryCard, Dashboard, ExpenseCard, IncomeCard, InvoiceCard, PriceCard, TransactionsCard} from './components';
import {Guide, LightField, map, palette, SceneWorld, settle, smooth, unit, Words} from './Stage';
import {CardTourWorld} from './CardTour';
import {Lens} from './Lens';
import {TourField} from './TourField';

type ShotProps = {frame: number};
const centered: React.CSSProperties = {position: 'absolute', inset: 0, width: 720, height: 1280, display: 'flex', justifyContent: 'center', alignItems: 'center'};
const pop = (frame: number, delay = 0) => spring({frame: frame - delay, fps: 60, config: {mass: 0.8, stiffness: 145, damping: 11}});

const Panel: React.FC<{night?: boolean}> = ({night = false}) => <div style={{width: 640, height: 455, position: 'relative'}}><div style={{transform: 'scale(.64,.6319444444)', transformOrigin: 'top left'}}><Dashboard light={!night} /></div></div>;

const Pointer: React.FC<{x: number; y: number; angle?: number}> = ({x, y, angle = 0}) => <svg width="48" height="56" viewBox="0 0 48 56" style={{position: 'absolute', left: x, top: y, transform: `rotate(${angle}deg)`, filter: 'drop-shadow(0 3px 3px #0006)'}}><path d="M5 4 L38 29 L22 31 L15 47 Z" fill="#142b20" stroke="#fff" strokeWidth="3" /></svg>;

const Open: React.FC<ShotProps> = ({frame}) => {
  const index = Math.min(2, Math.floor(frame / 60));
  const local = frame % 60;
  return <div style={{...centered, transform: `translateX(${-35 * smooth((local - 46) / 14)}px)`}}>
    {index > 0 && <div style={{position: 'absolute', left: 145, top: 600, width: 430, height: 84, background: '#b6f55666', transform: `scaleX(${1 - (1 - unit(local / 24)) ** 4})`}} />}
    <Words text={['Are You a', 'Freelancer', 'Creator'][index]} frame={local} color={palette.ink} size={index ? 74 : 66} style={{position: 'relative'}} />
  </div>;
};

const Spreadsheet: React.FC = () => <div style={{width: 104, height: 109, padding: 12, boxSizing: 'border-box', borderRadius: 16, background: 'linear-gradient(135deg,#adff7f,#18a65c)', boxShadow: '0 0 25px #95ff7055,inset 0 0 9px #ffffffaa', color: '#f4ffe9', fontSize: 25, fontWeight: 600}}><svg width="24" height="26" viewBox="0 0 24 26"><rect x="4" y="3" width="16" height="20" fill="#edffd588" stroke="#fff" strokeWidth="1" />{Array.from({length: 7}, (_, i) => <line key={i} x1="6" x2="18" y1={6 + i * 2.3} y2={6 + i * 2.3} stroke="#fff" />)}</svg><div>XLS</div></div>;

const Message: React.FC = () => <div style={{width: 464, height: 89, boxSizing: 'border-box', padding: 12, borderRadius: 16, color: '#213d28', background: '#ffffffc9', boxShadow: '0 0 25px #95ff7055,inset 0 0 9px #ffffffaa', fontSize: 17, fontWeight: 600}}><div>🟢 Client $$$</div><div style={{fontSize: 12, marginTop: 4}}>How much do I owe?　Where is the invoice?</div></div>;

const filePositions = [
  [-70,-180], [103,91], [276,362], [449,633], [622,904], [795,1175],
  [118,-104], [291,167], [464,438], [637,709], [-40,980], [133,1251],
  [306,-28], [479,243], [652,514], [-25,785],
];
const Chaos: React.FC<ShotProps> = ({frame}) => {
  if (frame < 150) {
    const text = frame < 60 ? 'Still Managing' : frame < 116 ? 'Finances' : 'through';
    const local = frame < 60 ? frame : frame < 116 ? frame - 60 : frame - 116;
    return <div style={{...centered, transform: `translateX(${-160 * smooth((frame - 112) / 38)}px)`}}><Words text={text} frame={local} color="#fff" /></div>;
  }
  return <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d'}}>{filePositions.map(([x, y], i) => {
    const p = pop(frame - 150, i * 4);
    const message = i % 5 === 0;
    return <div key={i} style={{position: 'absolute', left: x + Math.sin(frame / 88 + i) * 35, top: y - (frame - 150) * 0.9, transformStyle: 'preserve-3d', transform: `translate3d(${(1 - p) * 120}px,${(1 - p) * 180}px,${(i % 4 - 2) * 130 - (1 - p) * 300}px) rotateX(-8deg) rotateY(${Math.sin(i) * 23}deg) rotateZ(${Math.sin(i) * 12}deg) scale(${p})`}}>{message ? <Message /> : i % 2 ? <Spreadsheet /> : <div style={{width: 104, height: 109, borderRadius: 16, padding: 12, boxSizing: 'border-box', color: '#fff', fontSize: 25, background: 'linear-gradient(135deg,#adff7f,#18a65c)', boxShadow: '0 0 25px #95ff7055,inset 0 0 9px #ffffffaa'}}>⊞</div>}</div>;
  })}</div>;
};

const FunnelShot: React.FC<ShotProps> = ({frame}) => {
  const text = frame < 96 ? 'Payments' : frame < 186 ? 'Expenses' : 'Where is my Money?';
  return <>
    <svg width="720" height="1280" style={{position: 'absolute', inset: 0}}><path d="M-250 0 H970 L490 450 V900 L245 1130 V450 Z" fill="#e6ffbb25" /><ellipse cx="360" cy="1110" rx="430" ry="230" fill="#c9fc78" style={{filter: 'blur(26px)'}} /></svg>
    <div style={{...centered, top: -130, transform: `rotate(-8deg) translateY(${Math.sin(frame / 70) * 12}px)`}}><Words text={text} frame={frame % 96} color="#fff" size={frame < 186 ? 67 : 48} /></div>
    {Array.from({length: 10}, (_, i) => <div key={i} style={{position: 'absolute', left: 60 + (i * 127) % 600, top: 870 + (i * 79) % 350 + Math.sin(frame / 32 + i) * 28, padding: 18, borderRadius: 15, background: '#40ce82', color: '#fff', fontSize: 25, whiteSpace: 'nowrap', transform: `rotate(${i * 17 + frame * 0.25}deg) scale(${0.6 + 0.4 * Math.sin(i) ** 2})`, filter: 'blur(1px)', boxShadow: '0 0 25px #a2ffb4'}}>▤ XLS</div>)}
    <Pointer x={210 + frame * 0.55} y={1060 - frame * 0.2} />
  </>;
};

const Product: React.FC<ShotProps> = ({frame}) => {
  const p = settle(frame), incoming = 1 - p;
  const side = smooth((frame - 110) / 90);
  return <>
    <div style={{position: 'absolute', left: 40 - side * 180, top: 470, transform: `perspective(900px) translateZ(${-260 * incoming + Math.sin(frame / 110) * 32}px) rotateX(${12 * incoming}deg) rotateY(${-32 * incoming + Math.sin(frame / 130) * 5}deg) rotateZ(${-9 * incoming}deg) scale(${0.65 + p * 0.35}) translateY(${250 * incoming + Math.sin(frame / 60) * 9}px)`, transformStyle: 'preserve-3d'}}><Panel night /></div>
    {frame > 90 && <div style={{position: 'absolute', left: 460, top: 510, width: 240}}><Words text={'AI Powered\nFinance\nManager'} frame={frame - 90} color={palette.ink} size={42} /></div>}
  </>;
};

const Orbit: React.FC<ShotProps> = ({frame}) => <>
  <div style={centered}><Words text="Built For" frame={frame} size={67} /></div>
  {[180,290,400].map(r => <div key={r} style={{position: 'absolute', left: 360 - r, top: 640 - r, width: r * 2, height: r * 2, border: '1px dashed #d9ff832a', borderRadius: '50%'}} />)}
  {Array.from({length: 10}, (_, i) => {
    const a = i * 2.4 + frame * 0.0025, radius = 180 + (i % 3) * 110;
    const p = pop(frame, 24 + i * 4);
    return <div key={i} style={{position: 'absolute', left: 325 + Math.cos(a) * radius, top: 605 + Math.sin(a) * radius, transformStyle: 'preserve-3d', transform: `translateZ(${Math.sin(a) * 190}px) translateY(${(1 - p) * 140}px) rotateY(${Math.cos(a) * 18}deg) scale(${p * (0.7 + (i % 3) * 0.15)})`}}>
      <div style={{width: 68, height: 68, borderRadius: '50%', background: '#fff', boxShadow: '0 0 20px #d9ff8344', display: 'grid', placeItems: 'center'}}><div style={{width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(140deg,#ecffc0,#8ac630)'}} /></div>
      <div style={{textAlign: 'center', color: '#fff', fontSize: 12, marginTop: 8}}>{['Freelancer','Creator','Consultant'][i % 3]}</div>
    </div>;
  })}
</>;

const satelliteTypes = [
  {key: 'income', component: IncomeCard}, {key: 'invoice', component: InvoiceCard},
  {key: 'transactions', component: TransactionsCard}, {key: 'category', component: CategoryCard},
  {key: 'expense', component: ExpenseCard}, {key: 'income', component: IncomeCard},
] as const;
const satellitesDepth = [-240,110,-100,160,-190,60];
const Satellites: React.FC<{frame: number; scale?: number}> = ({frame, scale = 1}) => <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d'}}>{satelliteTypes.map(({key, component: Component}, i) => {
  const angle = i * Math.PI / 3 + frame * 0.0015, p = settle(frame, i * 6);
  const size = CARD_SIZE[key];
  return <div key={i} style={{position: 'absolute', width: size.width, height: size.height, left: 360 + Math.cos(angle) * (450 + (1 - p) * 180), top: 640 + Math.sin(angle) * (510 + (1 - p) * 220), transformStyle: 'preserve-3d', transform: `translate(-50%, -50%) translateZ(${satellitesDepth[i] - (1 - p) * 300}px) rotateX(${Math.sin(angle) * 10 + (1 - p) * 20}deg) rotateY(${Math.sin(angle) * 24}deg) rotateZ(${Math.cos(frame / 70 + i) * 5}deg) scale(${scale * (0.35 + (i % 2) * 0.13)})`}}><Component /></div>;
})}</div>;

const Workspace: React.FC<ShotProps> = ({frame}) => {
  const p = pop(frame), incoming = 1 - p;
  return <>
    <Satellites frame={frame} scale={1 - smooth(frame / 90) * 0.3} />
    <div style={{position: 'absolute', left: 40, top: 470, transformStyle: 'preserve-3d', transform: `perspective(900px) translateZ(${-280 * incoming}px) translateY(${170 * incoming}px) rotateX(${-12 * incoming}deg) rotateY(${30 * incoming + Math.sin(frame / 96) * 4}deg) scale(${0.3 + 0.7 * p})`}}><Panel /></div>
    <div style={{position: 'absolute', top: 350, width: 720}}><Words text="Simple" frame={frame - 20} color="#fff" /></div>
    <div style={{position: 'absolute', top: 955, width: 720}}><Words text="Workspace" frame={frame - 36} color="#fff" /></div>
  </>;
};

const Free: React.FC<ShotProps> = ({frame}) => {
  if (frame < 90) return <>
    <div style={{position: 'absolute', left: 40, top: 510, transform: `scale(${0.9 + Math.sin(frame / 70) * 0.02})`}}><Panel night /></div>
    <div style={{position: 'absolute', top: 1010, width: 720}}><Words text="The Best Part?" frame={frame} color={palette.ink} size={62} /></div>
    {['Invoices','Transactions','Charts','Expenses','AI Tools','Dark Mode'].map((text, i) => <div key={text} style={{position: 'absolute', left: 40 + (i % 3) * 230, top: (i < 3 ? 210 + i * 57 : 1080 + (i - 3) * 48) + Math.sin(frame / 60 + i) * 20, background: '#b9ea7766', color: '#608c38', padding: '5px 15px'}}>{text}</div>)}
  </>;
  const upgrade = frame >= 200;
  return <>
    {Array.from({length: 15}, (_, i) => <div key={i} style={{position: 'absolute', left: (i * 179) % 700, top: (i * 283 + frame * 0.8) % 1400 - 60, fontSize: 46, fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif', transform: `rotate(${Math.sin(frame / 64 + i) * 25}deg)`}}>{['😎','🔥','🤑','😲'][i % 4]}</div>)}
    <div style={centered}><Words text={upgrade ? 'Until You\nWanna\nUpgrade' : 'Completely\nFREE!!\nto Start'} frame={frame - (upgrade ? 200 : 90)} color={palette.ink} size={upgrade ? 66 : 76} /></div>
  </>;
};

const Pricing: React.FC<ShotProps> = ({frame}) => {
  const p = pop(frame - 188), incoming = 1 - p;
  return <>
    <Satellites frame={frame} />
    {frame < 188 ? <div style={centered}><Words text={frame < 80 ? 'That too at' : 'no monthly Subscription'} frame={frame < 80 ? frame : frame - 80} size={frame < 80 ? 67 : 48} /></div> : <div style={{position: 'absolute', left: 165, top: 395, width: 390, height: 480, transformStyle: 'preserve-3d', transform: `perspective(900px) translateZ(${-310 * incoming}px) translateY(${140 * incoming}px) rotateX(${-15 * incoming}deg) rotateY(${45 * incoming}deg) scale(${0.2 + 0.8 * p})`}}><PriceCard /></div>}
    <Pointer x={450 + Math.sin(frame / 80) * 130} y={960 - frame * 0.15} />
  </>;
};

const End: React.FC<ShotProps> = ({frame}) => {
  if (frame < 130) return <><Satellites frame={frame} /><div style={centered}><Words text={'∞\nLifetime\nAccess'} frame={frame} color={palette.ink} size={61} /></div></>;
  const arriving = unit((frame - 130) / 70);
  return <AbsoluteFill style={{background: '#fff'}}>
    <div style={{position: 'absolute', top: 110, width: 720, textAlign: 'center', color: '#111', fontSize: 45, fontWeight: 750}}><span style={{color: '#c1f476'}}>ϟ </span>finqube</div>
    <div style={{position: 'absolute', top: 395, width: 720}}><Words text="Join the Waitlist" frame={frame - 130} color={palette.ink} size={57} /></div>
    <div style={{position: 'absolute', left: 40, top: 510, transform: `scale(${0.94 + 0.06 * (1 - (1 - arriving) ** 4)})`}}><Panel night /></div>
    <div style={{position: 'absolute', top: 1010, width: 720, textAlign: 'center', color: '#53664b', fontSize: 25}}>www.finqube.one</div>
    <div style={{position: 'absolute', top: 1065, left: 260, width: 200, padding: '18px 0', boxSizing: 'border-box', borderRadius: 10, background: palette.ink, color: '#fff', fontSize: 27, textAlign: 'center', transform: `scale(${pop(frame - 180)})`}}>Join Now</div>
  </AbsoluteFill>;
};

const Shot: React.FC<{start: number; index: number; light: boolean; component: React.FC<ShotProps>}> = ({start, index, light, component: Component}) => {
  const frame = useCurrentFrame();
  return <><LightField frame={start + frame} light={light} /><SceneWorld frame={frame} shot={index}><Component frame={frame} /></SceneWorld></>;
};

const timeline = [
  {from: 0, end: 210, index: 0, light: true, component: Open, name: 'Question and moving guide'},
  {from: 210, end: 480, index: 1, light: false, component: Chaos, name: 'Finances and spreadsheet space'},
  {from: 480, end: 720, index: 2, light: false, component: FunnelShot, name: 'Payments funnel'},
  {from: 720, end: 948, index: 3, light: true, component: Product, name: 'Product introduction'},
  {from: 948, end: 1140, index: 4, light: false, component: Orbit, name: 'People orbit'},
  {from: 1500, end: 1650, index: 5, light: false, component: Workspace, name: 'Simple workspace'},
  {from: 1650, end: 1920, index: 6, light: true, component: Free, name: 'Free and upgrade'},
  {from: 1920, end: 2190, index: 7, light: false, component: Pricing, name: 'One-time payment'},
  {from: 2190, end: 2722, index: 8, light: true, component: End, name: 'Lifetime and waitlist'},
];

const Fonts: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [handle] = useState(() => delayRender('Load local typeface'));
  useEffect(() => {
    new FontFace('Finqube Sans', `url("${staticFile('fonts/Arimo.ttf')}")`, {weight: '100 900'}).load().then(font => {document.fonts.add(font); continueRender(handle);}).catch(cancelRender);
  }, [handle]);
  return <AbsoluteFill style={{fontFamily: 'Arial, Helvetica, "Finqube Sans", sans-serif', background: palette.dark, overflow: 'hidden'}}>{children}</AbsoluteFill>;
};

export const SceneFilm: React.FC = () => {
  const frame = useCurrentFrame();
  return <Fonts>
    {timeline.map(({from, end, name, ...rest}) => <Sequence key={from} from={from} durationInFrames={end - from} name={name}><Shot start={from} {...rest} /></Sequence>)}
    <Sequence from={1140} durationInFrames={360} name="Fisheye card tour"><Lens /></Sequence>
    <Guide frame={frame} />
    <Audio src={staticFile('audio/soundtrack.wav')} endAt={2722} volume={0.86} />
  </Fonts>;
};

export const CardTourSource: React.FC = () => {
  const frame = useCurrentFrame();
  return <Fonts><TourField frame={frame} /><CardTourWorld /></Fonts>;
};
