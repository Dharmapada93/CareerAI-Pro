import React, { useRef, Suspense, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useThemeStore } from "../../store/useThemeStore";

function HolographicOrb() {
  const orbRef = useRef<THREE.Mesh>(null);
  const { theme } = useThemeStore();

  useFrame(({ clock }) => {
    if (orbRef.current) {
      orbRef.current.rotation.y = clock.getElapsedTime() * 0.2;
      orbRef.current.rotation.x = clock.getElapsedTime() * 0.1;
    }
  });

  const orbColor = theme === "dark" ? "#8b5cf6" : "#6366f1";

  return (
    <Sphere ref={orbRef} args={[1.5, 64, 64]} scale={1}>
      <MeshDistortMaterial
        color={orbColor}
        roughness={0.1}
        metalness={0.9}
        distort={0.4}
        speed={2.5}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </Sphere>
  );
}

function FloatingCard({ position, rotation, color }: { position: [number, number, number]; rotation: [number, number, number]; color: string }) {
  const cardRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (cardRef.current) {
      cardRef.current.rotation.z = rotation[2] + Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={cardRef} position={position} rotation={rotation}>
        <boxGeometry args={[1.2, 1.6, 0.05]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.2}
          metalness={0.1}
          transparent
          opacity={0.7}
          transmission={0.6}
          thickness={0.5}
        />
      </mesh>
    </Float>
  );
}

export default function ThreeDHeroCanvas() {
  const { theme, reducedMotion } = useThemeStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (reducedMotion) return null;

  // Performance Rule: Disable heavy 3D on low-end mobile devices, fallback to CSS gradient
  if (isMobile) {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
    );
  }

  const starColor = theme === "dark" ? "#a78bfa" : "#818cf8";

  return (
    <div className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-80">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <HolographicOrb />
          
          {/* Floating resume pages */}
          <FloatingCard position={[-2.2, 1.2, 0]} rotation={[0.2, 0.4, -0.2]} color={theme === "dark" ? "#1e1b4b" : "#e0e7ff"} />
          <FloatingCard position={[2.5, -0.8, -0.5]} rotation={[-0.3, -0.5, 0.3]} color={theme === "dark" ? "#581c87" : "#fae8ff"} />
          <FloatingCard position={[-1.8, -1.5, 0.5]} rotation={[0.4, -0.2, 0.1]} color={theme === "dark" ? "#0f172a" : "#f1f5f9"} />

          <Stars radius={100} depth={50} count={120} factor={4} saturation={0.5} fade speed={1.5} />
        </Suspense>
      </Canvas>
    </div>
  );
}
