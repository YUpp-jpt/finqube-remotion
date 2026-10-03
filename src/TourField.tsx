import React from 'react';
import {AbsoluteFill} from 'remotion';
import {cameraAt, cameraSpeed} from './CardTour';

const sources = [
  {x:60, y:90, width:510, height:740, opacity:0.37, color:'#83be26'},
  {x:640, y:550, width:470, height:640, opacity:0.46, color:'#8bca23'},
  {x:30, y:1230, width:550, height:650, opacity:0.35, color:'#79ae1b'},
  {x:720, y:1100, width:380, height:780, opacity:0.19, color:'#b3d94b'},
];
export const TourField: React.FC<{frame: number}> = ({frame}) => {
  const camera = cameraAt(frame), speed = cameraSpeed(frame);
  return <AbsoluteFill style={{background: '#042f20', overflow: 'hidden'}}>
    {sources.map((source, i) => {
      const phase = frame / (58 + i * 13) + i * 1.7;
      return <div key={i} style={{position:'absolute',left:source.x-source.width/2+135*Math.sin(phase)-camera.x*(.055+i*.012),top:source.y-source.height/2+145*Math.cos(phase*.75)-camera.y*(.08+i*.018),width:source.width,height:source.height,background:source.color,borderRadius:'48%',filter:`blur(${85+i*12}px)`,opacity:source.opacity*(.85+.15*Math.sin(phase*.9)),transform:`rotate(${Math.sin(phase*.5)*24}deg) scale(${1+.16*Math.sin(phase)+speed*.035/65})`}} />;
    })}
    <AbsoluteFill style={{background:'radial-gradient(ellipse at center,transparent 30%,#00180e66 100%)'}} />
    {[0,1].map(i => {
      const age=frame-i*26;
      const rise=Math.min(1,Math.max(0,(age+12)/12));
      const fall=Math.min(1,Math.max(0,(age-38)/24));
      const opacity=rise*rise*(3-2*rise)*(1-fall*fall*(3-2*fall));
      return <div key={i} style={{position:'absolute',left:130+160*Math.sin(age/25)+i*240,top:440+age*2.5-i*220,width:72-i*20,height:22-i*6,borderRadius:40,background:'#ecff6f',boxShadow:'0 0 16px #efff8c,0 0 50px #b8ff35aa',transform:`rotate(${12+18*Math.sin(age/20)}deg)`,opacity:opacity*.9}} />;
    })}
  </AbsoluteFill>;
};
