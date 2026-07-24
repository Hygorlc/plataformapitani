"use client";

import { useEffect, useRef } from "react";

const GOLD = [150 / 255, 102 / 255, 7 / 255] as const;
const WHITE = [1, 1, 1] as const;
const GRID = [212 / 255, 212 / 255, 212 / 255] as const;

// Simplified Natural Earth coastlines. Keeping them in the bundle makes the
// globe appear immediately, without waiting for an external map request.
const CONTINENTS = [
  [[-168, 68], [-140, 70], [-125, 52], [-112, 49], [-96, 30], [-82, 25], [-80, 10], [-92, 15], [-106, 25], [-118, 32], [-130, 48], [-150, 58], [-168, 68]],
  [[-82, 12], [-70, 8], [-50, 2], [-35, -8], [-44, -24], [-55, -38], [-68, -55], [-76, -35], [-80, -10], [-82, 12]],
  [[-74, 60], [-48, 82], [-20, 76], [-28, 60], [-48, 58], [-74, 60]],
  [[-18, 35], [2, 43], [26, 37], [35, 30], [52, 12], [44, -12], [31, -34], [18, -35], [5, -20], [-5, 4], [-18, 15], [-18, 35]],
  [[-10, 36], [5, 58], [28, 72], [58, 70], [92, 78], [142, 66], [178, 55], [160, 42], [126, 38], [110, 20], [102, 5], [78, 8], [58, 25], [42, 30], [28, 42], [10, 44], [-10, 36]],
  [[112, -12], [132, -10], [154, -24], [146, -40], [121, -35], [112, -12]],
] as const;

type GeoJsonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type GeoJsonFeatureCollection = {
  features: Array<{ geometry: GeoJsonGeometry | null }>;
};

function spherePoint(latitude: number, longitude: number, radius = 1) {
  const lat = (latitude * Math.PI) / 180;
  const lng = (longitude * Math.PI) / 180;
  return [
    Math.cos(lat) * Math.sin(lng) * radius,
    Math.sin(lat) * radius,
    Math.cos(lat) * Math.cos(lng) * radius,
  ];
}

function pointInPolygon(longitude: number, latitude: number, polygon: readonly (readonly number[])[]) {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
    const [x1, y1] = polygon[current];
    const [x2, y2] = polygon[previous];
    const crosses =
      y1 > latitude !== y2 > latitude &&
      longitude < ((x2 - x1) * (latitude - y1)) / (y2 - y1) + x1;
    if (crosses) inside = !inside;
  }
  return inside;
}

function createGlobeGeometry() {
  const dots: number[] = [];
  const grid: number[] = [];
  const coastlines: number[] = [];

  for (let latitude = -82; latitude <= 82; latitude += 3.2) {
    const circumference = Math.max(
      12,
      Math.round(Math.cos((latitude * Math.PI) / 180) * 120)
    );

    for (let index = 0; index < circumference; index++) {
      const longitude = (index / circumference) * 360 - 180;
      if (CONTINENTS.some((polygon) => pointInPolygon(longitude, latitude, polygon))) {
        dots.push(...spherePoint(latitude, longitude, 1.012));
      }
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

  CONTINENTS.forEach((continent) => {
    for (let index = 1; index < continent.length; index++) {
      const [previousLongitude, previousLatitude] = continent[index - 1];
      const [longitude, latitude] = continent[index];
      const steps = Math.max(
        2,
        Math.ceil(Math.hypot(longitude - previousLongitude, latitude - previousLatitude) / 3)
      );
      let previous = spherePoint(previousLatitude, previousLongitude, 1.018);
      for (let step = 1; step <= steps; step++) {
        const progress = step / steps;
        const current = spherePoint(
          previousLatitude + (latitude - previousLatitude) * progress,
          previousLongitude + (longitude - previousLongitude) * progress,
          1.018
        );
        coastlines.push(...previous, ...current);
        previous = current;
      }
    }
  });

  return {
    dots: new Float32Array(dots),
    grid: new Float32Array(grid),
    coastlines: new Float32Array(coastlines),
  };
}

const GLOBE = createGlobeGeometry();

function createDetailedEarthGeometry(data: GeoJsonFeatureCollection) {
  const mapWidth = 2048;
  const mapHeight = 1024;
  const mask = document.createElement("canvas");
  mask.width = mapWidth;
  mask.height = mapHeight;
  const context = mask.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  const coastlines: number[] = [];
  const drawRing = (ring: number[][]) => {
    if (ring.length < 2) return;
    context.beginPath();
    ring.forEach(([longitude, latitude], index) => {
      const x = ((longitude + 180) / 360) * mapWidth;
      const y = ((90 - latitude) / 180) * mapHeight;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.fill();

    for (let index = 2; index < ring.length; index += 2) {
      const [previousLongitude, previousLatitude] = ring[index - 2];
      const [longitude, latitude] = ring[index];
      if (Math.abs(longitude - previousLongitude) > 120) continue;
      coastlines.push(
        ...spherePoint(previousLatitude, previousLongitude, 1.018),
        ...spherePoint(latitude, longitude, 1.018)
      );
    }
  };

  context.fillStyle = "#fff";
  data.features.forEach(({ geometry }) => {
    if (!geometry) return;
    if (geometry.type === "Polygon") {
      (geometry.coordinates as number[][][]).forEach(drawRing);
    } else {
      (geometry.coordinates as number[][][][]).forEach((polygon) =>
        polygon.forEach(drawRing)
      );
    }
  });

  const pixels = context.getImageData(0, 0, mapWidth, mapHeight).data;
  const dots: number[] = [];
  for (let latitude = -88; latitude <= 88; latitude += 1.5) {
    const circumference = Math.max(
      20,
      Math.round(Math.cos((latitude * Math.PI) / 180) * 240)
    );
    for (let index = 0; index < circumference; index++) {
      const longitude = (index / circumference) * 360 - 180;
      const x = Math.min(
        mapWidth - 1,
        Math.max(0, Math.round(((longitude + 180) / 360) * mapWidth))
      );
      const y = Math.min(
        mapHeight - 1,
        Math.max(0, Math.round(((90 - latitude) / 180) * mapHeight))
      );
      if (pixels[(y * mapWidth + x) * 4] > 128) {
        dots.push(...spherePoint(latitude, longitude, 1.012));
      }
    }
  }

  return {
    dots: new Float32Array(dots),
    coastlines: new Float32Array(coastlines),
  };
}

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
    const coastlineBuffer = gl.createBuffer();
    if (!dotBuffer || !gridBuffer || !coastlineBuffer) return;

    let dotCount = GLOBE.dots.length / 3;
    let coastlineCount = GLOBE.coastlines.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, dotBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, GLOBE.dots, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, GLOBE.grid, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, coastlineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, GLOBE.coastlines, gl.DYNAMIC_DRAW);

    let cancelled = false;
    void fetch(
      "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/50m/physical/ne_50m_land.json"
    )
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load Earth map");
        return response.json() as Promise<GeoJsonFeatureCollection>;
      })
      .then((data) => {
        if (cancelled) return;
        const detailed = createDetailedEarthGeometry(data);
        if (!detailed) return;
        gl.bindBuffer(gl.ARRAY_BUFFER, dotBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, detailed.dots, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, coastlineBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, detailed.coastlines, gl.DYNAMIC_DRAW);
        dotCount = detailed.dots.length / 3;
        coastlineCount = detailed.coastlines.length / 3;
      })
      .catch(() => {
        // The bundled simplified geometry remains visible as an offline fallback.
      });

    let frame = 0;
    let width = 1;
    let height = 1;
    let rotationY = -0.42;
    const rotationX = 0.24;

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
      const offset = aspect < 0.7 ? -0.32 : -0.42;
      gl.uniform1f(uniforms.rotationX, rotationX);
      gl.uniform1f(uniforms.rotationY, rotationY);
      gl.uniform1f(uniforms.aspect, aspect);
      gl.uniform1f(uniforms.offset, offset);
      gl.enableVertexAttribArray(position);

      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
      gl.uniform3f(uniforms.color, GRID[0], GRID[1], GRID[2]);
      gl.lineWidth(1.5);
      gl.uniform1f(uniforms.pointSize, 1);
      gl.uniform1f(uniforms.opacity, 1);
      gl.uniform1f(uniforms.roundPoints, 0);
      gl.drawArrays(gl.LINES, 0, GLOBE.grid.length / 3);

      gl.bindBuffer(gl.ARRAY_BUFFER, coastlineBuffer);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
      gl.uniform3f(uniforms.color, GOLD[0], GOLD[1], GOLD[2]);
      gl.uniform1f(uniforms.opacity, 0.95);
      gl.drawArrays(gl.LINES, 0, coastlineCount);

      gl.bindBuffer(gl.ARRAY_BUFFER, dotBuffer);
      gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
      gl.uniform3f(uniforms.color, WHITE[0], WHITE[1], WHITE[2]);
      gl.uniform1f(uniforms.pointSize, Math.min(window.devicePixelRatio || 1, 2) * 2.35);
      gl.uniform1f(uniforms.opacity, 0.94);
      gl.uniform1f(uniforms.roundPoints, 1);
      gl.drawArrays(gl.POINTS, 0, dotCount);

      rotationY -= 0.0022;
      frame = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    draw();

    return () => {
      cancelled = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      gl.deleteBuffer(dotBuffer);
      gl.deleteBuffer(gridBuffer);
      gl.deleteBuffer(coastlineBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      <div className="absolute right-[4.5%] top-1/2 hidden w-[300px] -translate-y-1/2 2xl:block">
        <div className="mb-5 h-px w-14 bg-[#966607]" />
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#d7b648]">
          Evolua. Lidere. Cresça.
        </p>
        <h2 className="text-3xl font-semibold leading-[1.12] tracking-tight text-white">
          Conhecimento que transforma decisões em crescimento.
        </h2>
        <p className="mt-5 text-sm leading-6 text-white/60">
          Uma plataforma criada para empresários que querem liderar com estratégia,
          acelerar resultados e construir negócios mais fortes.
        </p>
      </div>
    </div>
  );
}
