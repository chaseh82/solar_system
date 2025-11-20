import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PLANETS } from '../constants';
import { calculatePlanetPosition } from '../utils/orbitalMechanics';
import { PlanetData } from '../types';

// Fix for TypeScript errors regarding React Three Fiber intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      mesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      group: any;
      bufferGeometry: any;
      bufferAttribute: any;
      lineBasicMaterial: any;
      color: any;
      [key: string]: any;
    }
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      mesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      group: any;
      bufferGeometry: any;
      bufferAttribute: any;
      lineBasicMaterial: any;
      color: any;
      [key: string]: any;
    }
  }
}

interface SolarSystemProps {
  daysElapsed: number;
  onPlanetClick: (planet: PlanetData) => void;
}

interface PlanetProps {
  planet: PlanetData;
  daysElapsed: number;
  onClick: (p: PlanetData) => void;
}

// Alternate texture URL that might be more reliable in some environments
// Fallback is handled by the ErrorBoundary if this fails
const EARTH_TEXTURE_URL = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";

// Error Boundary specifically for 3D content (Materials)
// If a texture fails to load, this will catch it and render the fallback material instead of crashing the app
class TextureErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Component to load and apply Earth Texture
const EarthMaterial = () => {
  const texture = useTexture(EARTH_TEXTURE_URL);
  return <meshStandardMaterial map={texture} metalness={0.4} roughness={0.7} />;
};

const Sun = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshStandardMaterial 
        emissive="#FFD700" 
        emissiveIntensity={2} 
        color="#FFD700" 
      />
      <pointLight intensity={3} distance={300} decay={0.5} color="#ffffff" />
    </mesh>
  );
};

const Planet: React.FC<PlanetProps> = ({ planet, daysElapsed, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate position every frame
  useFrame(() => {
    if (meshRef.current) {
      const [x, y, z] = calculatePlanetPosition(planet, daysElapsed);
      meshRef.current.position.set(x, y, z);
    }
  });

  // Create orbit line visual
  const orbitPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * 2 * Math.PI;
      const periodDays = planet.period * 365.25;
      const t = (angle * periodDays) / (2 * Math.PI);
      const [x, y, z] = calculatePlanetPosition(planet, t);
      points.push(new THREE.Vector3(x, 0, z));
    }
    return points;
  }, [planet]);

  const isEarth = planet.name === 'Earth';

  // Fallback material if texture fails
  const fallbackMaterial = (
    <meshStandardMaterial 
      color={planet.color} 
      emissive={planet.color}
      emissiveIntensity={0.2} 
      metalness={0.2}
      roughness={0.8}
    />
  );

  return (
    <group>
       {/* Orbit Path Line */}
      {/* @ts-ignore */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={orbitPoints.length}
            array={new Float32Array(orbitPoints.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" transparent opacity={0.15} />
      </line>

      {/* The Planet Mesh */}
      <mesh 
        ref={meshRef} 
        onClick={(e) => { e.stopPropagation(); onClick(planet); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[planet.size, 32, 32]} />
        
        {isEarth ? (
          <TextureErrorBoundary fallback={fallbackMaterial}>
            <Suspense fallback={fallbackMaterial}>
              <EarthMaterial />
            </Suspense>
          </TextureErrorBoundary>
        ) : (
          fallbackMaterial
        )}
        
        {/* 
          Label Config:
          Removed distanceFactor={30}. Now rendering in screen space (fixed pixel size).
          This means when you zoom in (planet gets huge), the text stays small 
          relative to the screen, effectively "shrinking" relative to the planet 
          so it doesn't obscure the view.
        */}
        <Html style={{ pointerEvents: 'none' }}>
          <div className={`group relative flex flex-col items-center transition-all duration-300 ${hovered ? 'z-50 opacity-100 scale-110' : 'z-0 opacity-60 scale-100'}`}>
            <div className={`
              px-1.5 py-0.5 rounded border backdrop-blur-[1px] transition-colors duration-300
              ${hovered ? 'bg-black/60 border-white/30 text-white' : 'bg-transparent border-transparent text-white/70'}
            `}>
              <span className="text-[10px] font-medium tracking-wider uppercase shadow-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {planet.name}
              </span>
            </div>
          </div>
        </Html>
      </mesh>
    </group>
  );
};

export const SolarSystemScene: React.FC<SolarSystemProps> = ({ daysElapsed, onPlanetClick }) => {
  return (
    <Canvas camera={{ position: [0, 60, 90], fov: 45 }}>
      <color attach="background" args={['#050505']} />
      
      {/* Bright Ambient Light */}
      <ambientLight intensity={1.5} />
      
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* 
        Controls Config:
        Reduced speeds (rotate, zoom) for more precise control when magnified.
        Added damping for smoother movement.
      */}
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5} 
        maxDistance={500}
        rotateSpeed={0.3} 
        zoomSpeed={0.5}
      />

      <