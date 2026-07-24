"use client";

import { useEffect, useRef } from "react";

const GOLD = [150 / 255, 102 / 255, 7 / 255] as const;

function spherePoint(latitude: number, longitude: number, radius = 1) {
  const lat = (latitude * Math.PI) / 180;
  const lng = (longitude * Math.PI) / 180;
  return [
    Math.cos(lat) * Math.sin(lng) * radius,
    Math.sin(lat) * radius,
    Math.cos(lat) * Math.cos(lng) * radius,
  ];
}

function createGlobeGeometry() {
  const dots: number[] = [];
  const grid: number[] = [];

  // The same dotted-land approach used by the supplied Originkit globe,
  // represented as real points on a WebGL sphere.
  for (let latitude = -82; latitude <= 82; latitude += 4) {
    const circumference = Math.max(
      12,
      Math.round(Math.cos((latitude * Math.PI) / 180) * 96)
    );

    for (let index = 0; index < circumference; index++) {
      const longitude = (index / circumference) * 360 - 180;
      const land =
        Math.sin(longitude * 0.083 + latitude * 0.12) +
        Math.cos(longitude * 0.047 - latitude * 0.18) +
        Math.sin(longitude * 0.019 + latitude * 0.31);

      if (land > -0.42) dots.push(...spherePoint(latitude, longitude, 1.012));
    }
  }

  const addGridCurve = (points: number[][]) => {
    for (let index = 1; index < points.length; index++) {
      grid.push(...points[index - 1], ...points[index]);
    }
  };

  for (let latitude = -75; latitude <= 75; latitude += 15) {
    addGridCurve(
      Array.from({ length: 73 }, (_, index) =>
        spherePoint(latitude, -180 + index * 5, 1.004)
      )
    );
  }

  for (let longitude = -180; longitude < 180; longitude += 15) {
    addGridCurve(
      Array.from({ length: 49 }, (_, index) =>
        spherePoint(-90 + index * 3.75, longitude, 1.004)
      )
    );
  }

  return {
    dots: new Float32Array(dots),
    grid: new Float32Array(grid),
  };
}

const GLOBE = createGlobeGeometry();

const VERTEX_SHADER = `
  attribute vec3 aPosition;
  uniform float uRotationX;
  uniform float uRotationY;
  uniform float uAspect;
  uniform float uOffset;
  uniform float uPointSize;
  varying float vDepth;

  void main() {
    float cx = cos(uRotationX);
    float sx = sin(uRotationX);
    float cy = cos(uRotationY);
    float sy = sin(uRotationY);

    vec3 px = vec3(
      aPosition.x,
      aPosition.y * cx - aPosition.z * sx,
      aPosition.y * sx + aPosition.z * cx
    );
    vec3 p = vec3(
      px.x * cy + px.z * sy,
      px.y,
      -px.x * sy + px.z * cy
    );

    float cameraDepth = 3.15 - p.z;
    vec2 projected = p.xy * 2.35 / cameraDepth;
    projected.x = projected.x / uAspect + uOffset;

    gl_Position = vec4(projected, (cameraDepth - 2.15) / 2.3, 1.0);
    gl_PointSize = uPointSize * (3.15 / cameraDepth);
    vDepth = smoothstep(-1.0, 0.75, p.z);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uRoundPoints;
  varying float vDepth;

  void main() {
    if (uRoundPoints > 0.5) {
      vec2 point = gl_PointCoord - vec2(0.5);
      if (dot(point, point) > 0.25) discard;
    }
    gl_FragColor = vec4(uColor, uOpacity * mix(0.16, 1.0, vDepth));
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function LoginGlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    if (!gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertexShader || !fragmentShader || !program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const position = gl.getAttribLocation(program, "aPosition");
    const uniforms = {
      rotationX: gl.getUniformLocation(program, "uRotationX"),
      rotationY: gl.getUniformLocation(program, "uRotationY"),
      aspect: gl.getUniformLocation(program, "uAspect"),
      offset: gl.getUniformLocation(program, "uOffset"),
      pointSize: gl.getUniformLocation(program, "uPointSize"),
      color: gl.getUniformLocation(program, "uColor"),
      opacity: gl.getUniformLocation(program, "uOpacity"),
      roundPoints: gl.getUniformLocation(program, "uRoundPoints"),
    };

    const dotBuffer = gl.createBuffer();
    const gridBuffer = gl.createBuffer();
    if (!dotBuffer || !gridBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, dotBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, GLOBE.dots, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, GLOBE.grid, gl.STATIC_DRAW);

    let frame = 0;
    let width = 1;
    let height = 1;
    let rotationY = -0.42;
    const rotationX = 0.24;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = () => {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(program);

      const aspect = width / height;
      const offset = aspect < 0.7 ? -0.47 : -0.48;
      gl.uniform1f(uniforms.rotationX, rotationX);
      gl.uniform1f(uniforms.rotationY, rotationY);
      gl.uniform1f(uniforms.aspect, aspect);
      gl.uniform1f(uniforms.offset, offset);
      gl.uniform3f(uniforms.color, GOLD[0], GOLD[1], GOLD[2]);
      gl.enableVertexAttribArray(position);

      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uniforms.pointSize, 1);
      gl.uniform1f(uniforms.opacity, 0.2);
      gl.uniform1f(uniforms.roundPoints, 0);
      gl.drawArrays(gl.LINES, 0, GLOBE.grid.length / 3);

      gl.bindBuffer(gl.ARRAY_BUFFER, dotBuffer);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uniforms.pointSize, Math.min(window.devicePixelRatio || 1, 2) * 2.1);
      gl.uniform1f(uniforms.opacity, 0.76);
      gl.uniform1f(uniforms.roundPoints, 1);
      gl.drawArrays(gl.POINTS, 0, GLOBE.dots.length / 3);

      if (!reducedMotion) rotationY += 0.0018;
      frame = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    draw();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      gl.deleteBuffer(dotBuffer);
      gl.deleteBuffer(gridBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_52%,rgba(150,102,7,0.15),transparent_44%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(8,8,10,0.12)_44%,rgba(8,8,10,0.9)_73%,var(--background)_100%)]" />
    </div>
  );
}
