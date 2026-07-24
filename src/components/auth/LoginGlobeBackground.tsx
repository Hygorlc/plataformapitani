"use client";

import { useEffect, useRef } from "react";

type Point3D = { x: number; y: number; z: number; size: number; alpha: number };

const GOLD = "150, 102, 7";
const LATITUDES = [-60, -30, 0, 30, 60];
const LONGITUDES = Array.from({ length: 12 }, (_, index) => index * 30);

function rotateY(point: Point3D, angle: number) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    ...point,
    x: point.x * cos + point.z * sin,
    z: -point.x * sin + point.z * cos,
  };
}

function spherePoint(latitude: number, longitude: number): Point3D {
  const lat = (latitude * Math.PI) / 180;
  const lng = (longitude * Math.PI) / 180;
  return {
    x: Math.cos(lat) * Math.sin(lng),
    y: Math.sin(lat),
    z: Math.cos(lat) * Math.cos(lng),
    size: 1,
    alpha: 1,
  };
}

function createDots() {
  const points: Point3D[] = [];
  for (let latitude = -78; latitude <= 78; latitude += 6) {
    const circumference = Math.max(12, Math.round(Math.cos((latitude * Math.PI) / 180) * 60));
    for (let index = 0; index < circumference; index++) {
      const longitude = (index / circumference) * 360;
      const point = spherePoint(latitude, longitude);
      const landPattern =
        Math.sin(longitude * 0.083 + latitude * 0.12) +
        Math.cos(longitude * 0.047 - latitude * 0.18) +
        Math.sin(longitude * 0.019 + latitude * 0.31);

      if (landPattern > -0.42) {
        points.push({
          ...point,
          size: 0.8 + ((index + latitude + 90) % 4) * 0.16,
          alpha: 0.46 + ((index + 2) % 5) * 0.08,
        });
      }
    }
  }
  return points;
}

const DOTS = createDots();

export function LoginGlobeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let rotation = -0.45;
    let width = 0;
    let height = 0;
    let radius = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      radius = Math.min(width * 0.48, height * 0.7, 520);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const project = (point: Point3D) => {
      const rotated = rotateY(point, rotation);
      const perspective = 1 / (1.8 - rotated.z * 0.28);
      return {
        x: width * 0.24 + rotated.x * radius * perspective,
        y: height * 0.53 - rotated.y * radius * perspective,
        z: rotated.z,
        perspective,
      };
    };

    const drawLine = (points: Point3D[], alpha = 0.22) => {
      context.beginPath();
      let drawing = false;
      points.forEach((point) => {
        const projected = project(point);
        if (projected.z < -0.22) {
          drawing = false;
          return;
        }
        if (!drawing) {
          context.moveTo(projected.x, projected.y);
          drawing = true;
        } else {
          context.lineTo(projected.x, projected.y);
        }
      });
      context.strokeStyle = `rgba(${GOLD}, ${alpha})`;
      context.lineWidth = 0.7;
      context.stroke();
    };

    const render = () => {
      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(
        width * 0.24,
        height * 0.53,
        radius * 0.15,
        width * 0.24,
        height * 0.53,
        radius * 1.2
      );
      glow.addColorStop(0, "rgba(150, 102, 7, 0.16)");
      glow.addColorStop(0.58, "rgba(150, 102, 7, 0.055)");
      glow.addColorStop(1, "rgba(150, 102, 7, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      LATITUDES.forEach((latitude) => {
        drawLine(
          Array.from({ length: 73 }, (_, index) =>
            spherePoint(latitude, index * 5)
          )
        );
      });
      LONGITUDES.forEach((longitude) => {
        drawLine(
          Array.from({ length: 49 }, (_, index) =>
            spherePoint(-90 + index * 3.75, longitude)
          ),
          0.18
        );
      });

      DOTS.forEach((point) => {
        const projected = project(point);
        if (projected.z < -0.16) return;
        const depth = 0.28 + Math.max(0, projected.z) * 0.72;
        context.beginPath();
        context.arc(
          projected.x,
          projected.y,
          point.size * projected.perspective * 1.6,
          0,
          Math.PI * 2
        );
        context.fillStyle = `rgba(${GOLD}, ${point.alpha * depth})`;
        context.fill();
      });

      context.beginPath();
      context.arc(width * 0.24, height * 0.53, radius / 1.52, 0, Math.PI * 2);
      context.strokeStyle = "rgba(150, 102, 7, 0.68)";
      context.lineWidth = 1.2;
      context.shadowColor = "rgba(212, 175, 55, 0.4)";
      context.shadowBlur = 14;
      context.stroke();
      context.shadowBlur = 0;

      if (!reducedMotion) rotation += 0.0017;
      frame = window.requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    render();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full opacity-90" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(8,8,10,0.1)_42%,rgba(8,8,10,0.9)_72%,var(--background)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_53%,transparent_0%,rgba(8,8,10,0.14)_42%,rgba(8,8,10,0.65)_78%)]" />
    </div>
  );
}
