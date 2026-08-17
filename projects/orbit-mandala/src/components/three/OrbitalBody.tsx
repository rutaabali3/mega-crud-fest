import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Trail } from "@react-three/drei";
import * as THREE from "three";
import type { CelestialBody } from "@/types/celestial";

interface OrbitalBodyProps {
  body: CelestialBody;
  focused: boolean;
  dimmed: boolean;
  onSelect: (id: string) => void;
}

// Map body type to geometry
function BodyGeometry({ type, size }: { type: CelestialBody["type"]; size: number }) {
  switch (type) {
    case "moon":
      return <sphereGeometry args={[size * 0.3, 16, 16]} />;
    case "comet":
      return <coneGeometry args={[size * 0.25, size * 0.7, 8]} />;
    case "star":
      return <octahedronGeometry args={[size * 0.35, 0]} />;
    default:
      return <sphereGeometry args={[size * 0.4, 24, 24]} />;
  }
}

export function OrbitalBody({ body, focused, dimmed, onSelect }: OrbitalBodyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  // Random phase offset so bodies don't all start at same position
  const phaseOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  // Time drift based on creation date
  const timeDrift = useMemo(() => {
    const daysSinceCreation = (Date.now() - new Date(body.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation * 0.01;
  }, [body.createdAt]);

  const currentDistance = Math.max(3, body.distance - timeDrift);

  useFrame(({ clock }) => {
    if (!groupRef.current || !materialRef.current) return;
    const t = clock.getElapsedTime();

    // Elliptical orbit: x = d*cos, z = d*0.4*sin
    const angle = t * body.speed * 0.3 + phaseOffset;
    groupRef.current.position.x = currentDistance * Math.cos(angle);
    groupRef.current.position.z = currentDistance * 0.4 * Math.sin(angle);
    groupRef.current.position.y = Math.sin(angle * 2) * 0.3; // slight vertical bob

    // Self rotation
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      if (body.type === "comet") meshRef.current.rotation.x += 0.005;
    }

    // Hover scale lerp
    const targetScale = hovered ? body.size * 1.35 : body.size;
    const currentScale = meshRef.current?.scale.x ?? body.size;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.12);
    meshRef.current?.scale.setScalar(newScale);

    // Emissive intensity
    const targetEmissive = hovered ? 1.8 : focused ? 1.2 : 0.3;
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      materialRef.current.emissiveIntensity,
      targetEmissive,
      0.1
    );

    // Dimming
    const targetOpacity = dimmed ? 0.25 : 1;
    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity,
      targetOpacity,
      0.08
    );
  });

  const color = new THREE.Color(body.color);

  return (
    <group ref={groupRef}>
      <Trail
        width={body.type === "comet" ? 2 : 0.8}
        length={6}
        color={body.color}
        attenuation={(t) => t * t}
      >
        <mesh
          ref={meshRef}
          scale={body.size}
          onPointerEnter={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerLeave={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(body.id);
          }}
        >
          <BodyGeometry type={body.type} size={1} />
          <meshStandardMaterial
            ref={materialRef}
            color={body.color}
            emissive={body.color}
            emissiveIntensity={0.3}
            roughness={0.4}
            metalness={0.3}
            transparent
            opacity={1}
          />
        </mesh>
      </Trail>

      {/* Name label on hover */}
      {hovered && (
        <Html center distanceFactor={15} style={{ pointerEvents: "none" }}>
          <div className="glass rounded-lg px-3 py-1.5 text-center whitespace-nowrap animate-fade-in">
            <p className="text-sm font-medium text-foreground">{body.name}</p>
            <p className="text-xs text-muted-foreground">{body.category}</p>
          </div>
        </Html>
      )}
    </group>
  );
}
