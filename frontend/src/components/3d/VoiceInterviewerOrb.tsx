import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useThemeStore } from "../../store/useThemeStore";

interface OrbProps {
  isSpeaking: boolean;
  isListening: boolean;
  theme: string;
}

function InterviewerMesh({ isSpeaking, isListening, theme }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    
    // Scale pulsing to simulate speaking / listening activity
    let scale = 1.0;
    let speed = 1.0;
    
    if (isSpeaking) {
      scale = 1.0 + Math.sin(clock.getElapsedTime() * 15) * 0.15;
      speed = 4.0;
    } else if (isListening) {
      scale = 1.0 + Math.sin(clock.getElapsedTime() * 8) * 0.05;
      speed = 2.0;
    } else {
      scale = 1.0 + Math.sin(clock.getElapsedTime() * 2) * 0.02;
      speed = 0.5;
    }
    
    meshRef.current.scale.set(scale, scale, scale);
    meshRef.current.rotation.y = clock.getElapsedTime() * (isSpeaking ? 1.5 : 0.4);
  });

  const baseColor = theme === "dark" ? "#10b981" : "#059669"; // Emerald/Green for active listening
  const speakingColor = theme === "dark" ? "#ec4899" : "#db2777"; // Pink/Magenta for speaking
  const idleColor = theme === "dark" ? "#8b5cf6" : "#6366f1"; // Violet/Indigo for idle

  const activeColor = isSpeaking ? speakingColor : isListening ? baseColor : idleColor;
  const distortion = isSpeaking ? 0.6 : isListening ? 0.35 : 0.15;

  return (
    <Sphere ref={meshRef} args={[1.2, 64, 64]} scale={1}>
      <MeshDistortMaterial
        color={activeColor}
        roughness={0.2}
        metalness={0.8}
        distort={distortion}
        speed={isSpeaking ? 3.0 : 1.5}
        clearcoat={0.8}
        clearcoatRoughness={0.1}
      />
    </Sphere>
  );
}

export default function VoiceInterviewerOrb({ isSpeaking = false, isListening = false }) {
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

  // Fallback for mobile devices: Render a pulse wave in CSS
  if (isMobile) {
    return (
      <div className="flex items-center justify-center h-48 w-full">
        <div className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-500 ${
          isSpeaking 
            ? "bg-pink-500/20 shadow-lg shadow-pink-500/20" 
            : isListening 
            ? "bg-emerald-500/20 shadow-lg shadow-emerald-500/20" 
            : "bg-brand-500/20 shadow-lg shadow-brand-500/20"
        }`}>
          {/* Pulsing Outer Ring */}
          <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
            isSpeaking ? "bg-pink-500" : isListening ? "bg-emerald-500" : "bg-brand-500"
          }`} style={{ animationDuration: isSpeaking ? "0.8s" : "2s" }} />
          
          {/* Solid Core */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isSpeaking ? "bg-pink-600" : isListening ? "bg-emerald-600" : "bg-brand-600"
          }`}>
            <span className="text-white text-xs font-semibold">
              {isSpeaking ? "AI Speaking" : isListening ? "Listening" : "AI Idle"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 4.0], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, 10]} intensity={0.2} />
        <directionalLight position={[0, 0, 5]} intensity={0.5} />
        
        <InterviewerMesh isSpeaking={isSpeaking} isListening={isListening} theme={theme} />
      </Canvas>
    </div>
  );
}
