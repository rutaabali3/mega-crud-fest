import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function CentralSun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return;
    const t = clock.getElapsedTime();

    // Breathing pulse: scale 1.0 → 1.08 over 4s sine
    const pulse = 1.0 + 0.08 * Math.sin((t * Math.PI * 2) / 4);
    meshRef.current.scale.setScalar(pulse);

    // Slow Y-axis rotation
    meshRef.current.rotation.y += 0.003;

    // Emissive breathing
    const emissiveIntensity = 0.8 + 0.4 * Math.sin((t * Math.PI * 2) / 4);
    materialRef.current.emissiveIntensity = emissiveIntensity;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#FFD700"
        emissive="#FFA500"
        emissiveIntensity={1}
        roughness={0.2}
        metalness={0.1}
      />
      {/* Outer glow sphere */}
      <mesh scale={1.8}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color="#FFA500" transparent opacity={0.05} />
      </mesh>
    </mesh>
  );
}
