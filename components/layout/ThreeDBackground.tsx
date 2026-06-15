"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

interface Particle {
  x: number;
  y: number;
  z: number; // 3D depth coordinate
  vx: number;
  vy: number;
  vz: number;
  radius: number;
}

export function ThreeDBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme, reducedMotion } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (reducedMotion) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);


    const particles: Particle[] = [];
    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    
    // Mouse coords
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180,
    };

    // Color systems
    const getColors = () => {
      if (theme === "dark") {
        return {
          particleColor: "rgba(139, 92, 246, 0.45)", // soft violet
          lineColor: "rgba(139, 92, 246, 0.08)",
          glowColor: "rgba(139, 92, 246, 0.15)",
        };
      } else {
        return {
          particleColor: "rgba(99, 102, 241, 0.3)", // soft indigo
          lineColor: "rgba(99, 102, 241, 0.06)",
          glowColor: "rgba(99, 102, 241, 0.15)",
        };
      }
    };

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 + 100, // Depth between 100 and 500
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 2 + 1,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Draw loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      const colors = getColors();

      // Mouse interactive spot
      if (mouse.x > -1000) {
        const grad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius
        );
        grad.addColorStop(0, colors.glowColor);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw particles
      particles.forEach((p) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Depth bounds bounce
        if (p.z < 100 || p.z > 500) p.vz = -p.vz;

        // Boundaries loop
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Perspective projection simulation
        const scale = 300 / p.z; // Closer particles are larger and faster
        const projX = (p.x - width / 2) * scale + width / 2;
        const projY = (p.y - height / 2) * scale + height / 2;
        const projRadius = p.radius * scale;

        // Interactive mouse magnetic pull
        if (mouse.x > -1000) {
          const dx = mouse.x - projX;
          const dy = mouse.y - projY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            // Pull slightly
            p.x += (dx / dist) * force * 0.7;
            p.y += (dy / dist) * force * 0.7;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(projX, projY, projRadius, 0, Math.PI * 2);
        ctx.fillStyle = colors.particleColor;
        ctx.fill();
      });

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const scale1 = 300 / p1.z;
        const projX1 = (p1.x - width / 2) * scale1 + width / 2;
        const projY1 = (p1.y - height / 2) * scale1 + height / 2;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const scale2 = 300 / p2.z;
          const projX2 = (p2.x - width / 2) * scale2 + width / 2;
          const projY2 = (p2.y - height / 2) * scale2 + height / 2;

          const dx = projX1 - projX2;
          const dy = projY1 - projY2;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect if particles are close
          if (dist < 130) {
            const alpha = (130 - dist) / 130;
            ctx.beginPath();
            ctx.moveTo(projX1, projY1);
            ctx.lineTo(projX2, projY2);
            ctx.strokeStyle = colors.lineColor.replace(
              "0.08",
              (alpha * 0.12).toFixed(2)
            );
            ctx.lineWidth = 0.5 * scale1;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block transition-all"
      style={{ mixBlendMode: theme === "dark" ? "screen" : "multiply" }}
    />
  );
}
