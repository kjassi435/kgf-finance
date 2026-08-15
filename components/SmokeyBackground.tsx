"use client";

import { useEffect, useRef, useState } from "react";

const vertexSmokeySource = `
  attribute vec4 a_position;
  void main() {
    gl_Position = a_position;
  }
`;

const fragmentSmokeySource = `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 u_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = fragCoord / iResolution;
    vec2 centeredUV = (2.0 * fragCoord - iResolution.xy) / min(iResolution.x, iResolution.y);

    float time = iTime * 0.5;

    vec2 mouse = iMouse / iResolution;
    vec2 rippleCenter = 2.0 * mouse - 1.0;

    vec2 distortion = centeredUV;
    for (float i = 1.0; i < 8.0; i++) {
        distortion.x += 0.5 / i * cos(i * 2.0 * distortion.y + time + rippleCenter.x * 3.1415);
        distortion.y += 0.5 / i * cos(i * 2.0 * distortion.x + time + rippleCenter.y * 3.1415);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    float glow = smoothstep(0.9, 0.2, wave);

    fragColor = vec4(u_color * glow, 1.0);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

interface SmokeyBackgroundProps {
  backdropBlurAmount?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  color?: string;
  className?: string;
}

const blurClassMap: Record<string, string> = {
  none: "backdrop-blur-none",
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
  "3xl": "backdrop-blur-3xl",
};

export function SmokeyBackground({
  backdropBlurAmount = "sm",
  color = "#1E40AF",
  className = "",
}: SmokeyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader error:", gl.getShaderInfoLog(shader));
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, vertexSmokeySource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragmentSmokeySource);
    if (!vs || !fs) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const iRes = gl.getUniformLocation(program, "iResolution");
    const iTime = gl.getUniformLocation(program, "iTime");
    const iMouse = gl.getUniformLocation(program, "iMouse");
    const uColor = gl.getUniformLocation(program, "u_color");

    const hexToRgb = (hex: string): [number, number, number] => {
      const r = parseInt(hex.substring(1, 3), 16) / 255;
      const g = parseInt(hex.substring(3, 5), 16) / 255;
      const b = parseInt(hex.substring(5, 7), 16) / 255;
      return [r, g, b];
    };
    const [r, g, b] = hexToRgb(color);
    gl.uniform3f(uColor, r, g, b);

    const start = Date.now();
    const render = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      const t = (Date.now() - start) / 1000;
      gl.uniform2f(iRes, w, h);
      gl.uniform1f(iTime, t);
      gl.uniform2f(
        iMouse,
        hoverRef.current ? mouseRef.current.x : w / 2,
        hoverRef.current ? h - mouseRef.current.y : h / 2
      );
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    };
    render();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onEnter = () => (hoverRef.current = true);
    const onLeave = () => (hoverRef.current = false);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseenter", onEnter);
    canvas.addEventListener("mouseleave", onLeave);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseenter", onEnter);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [color]);

  const blur = blurClassMap[backdropBlurAmount] || blurClassMap["sm"];

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className={`absolute inset-0 ${blur}`} />
    </div>
  );
}
