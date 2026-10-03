import React, {useCallback, useRef} from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {cameraSpeed} from './CardTour';

const vert = `
  attribute vec2 position;
  varying vec2 samplePosition;
  void main() {
    samplePosition = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;
const frag = `
  precision highp float;
  varying vec2 samplePosition;
  uniform sampler2D scene;
  uniform float distortion;
  void main() {
    vec2 offset = samplePosition - vec2(0.5);
    vec2 pixels = offset * vec2(720.0, 1280.0);
    float radialDistance = dot(pixels, pixels) / 539200.0;
    float magnification = (1.0 + distortion * radialDistance) / (1.0 + distortion);
    vec2 incoming = vec2(0.5) + offset * magnification;
    gl_FragColor = texture2D(scene, incoming);
  }
`;
type Renderer = {gl: WebGLRenderingContext; texture: WebGLTexture; amount: WebGLUniformLocation | null};

function setup(canvas: HTMLCanvasElement): Renderer {
  const gl = canvas.getContext('webgl', {alpha: false, antialias: false, preserveDrawingBuffer: true});
  if (!gl) throw new Error('A WebGL context is required for the continuous optical projection.');
  const shader = (type: number, body: string) => {
    const s = gl.createShader(type);
    if (!s) throw new Error('Cannot allocate optical shader.');
    gl.shaderSource(s, body); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'Shader compilation failed.');
    return s;
  };
  const program = gl.createProgram();
  if (!program) throw new Error('Cannot allocate optical renderer.');
  gl.attachShader(program, shader(gl.VERTEX_SHADER, vert));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Optical program failed.');
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const texture = gl.createTexture();
  if (!texture) throw new Error('Cannot allocate optical texture.');
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(program, 'scene'), 0);
  gl.viewport(0, 0, 720, 1280);
  return {gl, texture, amount: gl.getUniformLocation(program, 'distortion')};
}

export const Lens: React.FC = () => {
  const frame = useCurrentFrame();
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<Renderer | null>(null);
  const value = useRef(0);
  const speed = cameraSpeed(frame);
  value.current = 0.2584 + 0.1972 * speed / (24 + speed);
  const draw = useCallback((image: CanvasImageSource) => {
    if (!canvas.current) return;
    const {gl, texture, amount} = renderer.current ?? (renderer.current = setup(canvas.current));
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image as TexImageSource);
    gl.uniform1f(amount, value.current);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.finish();
  }, []);
  return <AbsoluteFill style={{background: '#032d1e'}}>
    <canvas ref={canvas} width="720" height="1280" style={{width: 720, height: 1280}} />
    <OffthreadVideo src={staticFile('card-tour-source.mp4')} muted onVideoFrame={draw} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
  </AbsoluteFill>;
};
