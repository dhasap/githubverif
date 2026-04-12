"use client";

import { useEffect, useCallback, useRef, memo } from "react";

interface ConfettiProps {
  isActive: boolean;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const colors = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EF4444", // red-500
  "#8B5CF6", // violet-500
  "#EC4899", // pink-500
  "#06B6D4", // cyan-500
];

const Confetti = memo(function Confetti({ isActive, onComplete }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const isActiveRef = useRef(isActive);

  // Keep ref in sync with prop
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const createParticle = useCallback((x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 15 + 5;
    return {
      x,
      y,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    particlesRef.current = [];
    frameCountRef.current = 0;
    isActiveRef.current = false;
  }, []);

  useEffect(() => {
    if (!isActive) {
      cleanup();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Create particles from center
    particlesRef.current = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < 100; i++) {
      particlesRef.current.push(createParticle(centerX, centerY));
    }

    frameCountRef.current = 0;
    const maxFrames = 180; // ~3 seconds at 60fps

    const animate = () => {
      // Check if still active
      if (!isActiveRef.current) {
        cleanup();
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.5; // gravity
        particle.vx *= 0.99; // air resistance
        particle.rotation += particle.rotationSpeed;
        particle.opacity -= 0.01;

        // Draw particle
        if (particle.opacity > 0) {
          ctx.save();
          ctx.translate(particle.x, particle.y);
          ctx.rotate((particle.rotation * Math.PI) / 180);
          ctx.globalAlpha = particle.opacity;
          ctx.fillStyle = particle.color;
          ctx.fillRect(
            -particle.size / 2,
            -particle.size / 2,
            particle.size,
            particle.size
          );
          ctx.restore();
          return true;
        }
        return false;
      });

      frameCountRef.current++;

      if (frameCountRef.current < maxFrames && particlesRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (isActiveRef.current) {
        cleanup();
      }
    };
  }, [isActive, createParticle, cleanup, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ position: "fixed", top: 0, left: 0 }}
    />
  );
});

export default Confetti;
