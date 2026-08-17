import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { CentralSun } from "./CentralSun";
import { OrbitalBody } from "./OrbitalBody";
import type { CelestialBody } from "@/types/celestial";

interface CosmicSceneProps {
  bodies: CelestialBody[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

function Scene({ bodies, selectedId, onSelect, onDeselect }: Omit<CosmicSceneProps, "canvasRef">) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#FFD700" decay={2} />

      <CentralSun />

      {bodies.map((body) => (
        <OrbitalBody
          key={body.id}
          body={body}
          focused={selectedId === body.id}
          dimmed={selectedId !== null && selectedId !== body.id}
          onSelect={onSelect}
        />
      ))}

      <Stars radius={100} depth={80} count={800} factor={3} saturation={0.1} fade speed={0.5} />

      {/* Orbit rings for visual reference */}
      {bodies.map((body) => (
        <mesh key={`ring-${body.id}`} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[body.distance - 0.02, body.distance + 0.02, 64]} />
          <meshBasicMaterial
            color={body.color}
            transparent
            opacity={selectedId === body.id ? 0.15 : 0.04}
          />
        </mesh>
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={60}
        autoRotate
        autoRotateSpeed={0.15}
        enableDamping
        dampingFactor={0.05}
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          intensity={1.2}
          mipmapBlur
        />
      </EffectComposer>

      {/* Click on void to deselect */}
      <mesh visible={false} onClick={onDeselect}>
        <sphereGeometry args={[100, 8, 8]} />
        <meshBasicMaterial side={2} />
      </mesh>
    </>
  );
}

export function CosmicScene({ bodies, selectedId, onSelect, onDeselect, canvasRef }: CosmicSceneProps) {
  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 12, 25], fov: 50 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      className="!fixed inset-0"
      style={{ background: "hsl(230, 25%, 3%)" }}
    >
      <Suspense fallback={null}>
        <Scene
          bodies={bodies}
          selectedId={selectedId}
          onSelect={onSelect}
          onDeselect={onDeselect}
        />
      </Suspense>
    </Canvas>
  );
}
