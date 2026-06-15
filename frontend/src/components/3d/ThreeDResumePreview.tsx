import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useThemeStore } from "../../store/useThemeStore";

function ResumeMesh({ theme }: { theme: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Smoothly tilt card based on mouse coordinates when hovered
    const targetX = hovered ? (state.mouse.x * Math.PI) / 8 : 0;
    const targetY = hovered ? (state.mouse.y * Math.PI) / 8 : 0;
    
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetX, 0.1);
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, -targetY, 0.1);
    
    // Subtle float animation
    meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
  });

  const cardColor = theme === "dark" ? "#1e293b" : "#ffffff";
  const textColor = theme === "dark" ? "#475569" : "#e2e8f0";
  const brandColor = theme === "dark" ? "#8b5cf6" : "#6366f1";

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={1}
    >
      {/* Resume A4 Ratio Page Card */}
      <boxGeometry args={[2.1, 2.97, 0.08]} />
      <meshPhysicalMaterial
        color={cardColor}
        roughness={0.4}
        metalness={0.1}
        clearcoat={0.3}
        clearcoatRoughness={0.2}
      />
      
      {/* Decorative details simulating a resume structure */}
      {/* Header Accent */}
      <mesh position={[0, 1.2, 0.045]}>
        <boxGeometry args={[1.7, 0.12, 0.005]} />
        <meshBasicMaterial color={brandColor} />
      </mesh>

      {/* Name Placeholder */}
      <mesh position={[-0.5, 0.9, 0.045]}>
        <boxGeometry args={[0.7, 0.08, 0.005]} />
        <meshBasicMaterial color={theme === "dark" ? "#f8fafc" : "#0f172a"} />
      </mesh>

      {/* Profile Photo Placeholder */}
      <mesh position={[0.6, 0.9, 0.045]}>
        <boxGeometry args={[0.4, 0.4, 0.005]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* Line 1 */}
      <mesh position={[-0.2, 0.5, 0.045]}>
        <boxGeometry args={[1.3, 0.04, 0.005]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* Line 2 */}
      <mesh position={[-0.1, 0.35, 0.045]}>
        <boxGeometry args={[1.5, 0.04, 0.005]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* Section Divider */}
      <mesh position={[0, 0.1, 0.045]}>
        <boxGeometry args={[1.7, 0.015, 0.005]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* Section Header */}
      <mesh position={[-0.6, -0.1, 0.045]}>
        <boxGeometry args={[0.5, 0.06, 0.005]} />
        <meshBasicMaterial color={brandColor} />
      </mesh>

      {/* Line 3 */}
      <mesh position={[0, -0.3, 0.045]}>
        <boxGeometry args={[1.7, 0.04, 0.005]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* Line 4 */}
      <mesh position={[0.1, -0.45, 0.045]}>
        <boxGeometry args={[1.5, 0.04, 0.005]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* Line 5 */}
      <mesh position={[-0.15, -0.6, 0.045]}>
        <boxGeometry args={[1.4, 0.04, 0.005]} />
        <meshBasicMaterial color={textColor} />
      </mesh>

      {/* Section Divider 2 */}
      <mesh position={[0, -0.8, 0.045]}>
        <boxGeometry args={[1.7, 0.015, 0.005]} />
        <meshBasicMaterial color={textColor} />
      </mesh>
    </mesh>
  );
}

export default function ThreeDResumePreview() {
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

  // Fallback styling for mobile viewports
  if (isMobile) {
    return (
      <div className="w-full max-w-[280px] aspect-[1/1.41] mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between animate-float">
        <div className="flex justify-between items-start">
          <div className="w-24 h-4 bg-brand-500 rounded-md" />
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="space-y-3 flex-1 pt-8">
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="w-[85%] h-2 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="w-[90%] h-2 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="w-[40%] h-3 bg-indigo-500 rounded mt-6" />
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded mt-2" />
          <div className="w-[95%] h-2 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded mt-4" />
      </div>
    );
  }

  return (
    <div className="w-full h-[380px] pointer-events-auto cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} intensity={1.5} />
        <pointLight position={[-5, -5, 5]} intensity={0.3} />
        <directionalLight position={[0, 0, 8]} intensity={0.5} />
        
        <ResumeMesh theme={theme} />
      </Canvas>
    </div>
  );
}
