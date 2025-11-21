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
      ringGeometry: any;
      // Index signature to allow other R3F elements and suppress strict type checking
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
      ringGeometry: any;
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

// Asset Configuration Interface
interface PlanetAssets {
  map: string;
  normalMap?: string;
  specularMap?: string;
  cloudsMap?: string;
}

// Texture URLs - Switched to a more reliable source (yuripizarro/solar-system-threejs-react)
// This repo contains consistent 2k/4k textures for the solar system
const PLANET_ASSETS: Record<string, PlanetAssets> = {
  Mercury: {
    map: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/mercury.jpg",
  },
  Venus: {
    map: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/venus.jpg",
  },
  Earth: {
    map: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/earth.jpg",
    normalMap: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/earth-normal.jpg",
    specularMap: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/earth-specular.jpg",
    cloudsMap: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/earth-clouds.jpg",
  },
  Mars: {
    map: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/mars.jpg",
    normalMap: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/mars-normal.jpg",
  },
  Jupiter: {
    map: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/jupiter.jpg",
  },
  Saturn: {
    map: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/saturn.jpg",
  },
  Uranus: {
    map: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/uranus.jpg",
  },
  Neptune: {
    map: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/neptune.jpg",
  },
  Pluto: {
    map: "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/pluto.jpg",
  }
};

const SATURN_RING_TEXTURE = "https://raw.githubusercontent.com/yuripizarro/solar-system-threejs-react/main/public/textures/saturn-ring.png";

// Error Boundary specifically for 3D content (Materials)
class TextureErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.warn("Texture loading error caught:", error);
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Component to load and apply Planet Texture
const PlanetTextureMaterial = ({ name, assets }: { name: string, assets: PlanetAssets }) => {
  // useTexture will load all textures in the object
  const textureProps: any = { map: assets.map };
  if (assets.normalMap) textureProps.normalMap = assets.normalMap;
  if (assets.specularMap) textureProps.specularMap = assets.specularMap;

  const textures = useTexture(textureProps);
  
  const isEarth = name === 'Earth';
  const isGasGiant = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Venus'].includes(name);

  return (
    <meshStandardMaterial 
      {...textures}
      metalness={isEarth ? 0.1 : 0.0} 
      // Earth is slightly glossier (0.6) than dusty planets (0.8) or gas giants (0.9)
      roughness={isEarth ? 0.6 : (isGasGiant ? 0.9 : 0.8)}
      normalScale={new THREE.Vector2(3, 3)} // Exaggerate the terrain slightly for visibility
    />
  );
};

// Separate Cloud Layer for Earth
const PlanetClouds = ({ cloudsMap, size }: { cloudsMap: string, size: number }) => {
  const texture = useTexture(cloudsMap);
  const cloudRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0005; // Clouds rotate slightly faster/independent of earth
    }
  });

  return (
    <mesh ref={cloudRef}>
      {/* Slightly larger than the planet */}
      <sphereGeometry args={[size * 1.015, 64, 64]} />
      <meshStandardMaterial 
        map={texture} 
        transparent 
        opacity={0.6} 
        blending={THREE.AdditiveBlending} 
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

// Specific component for Saturn's Rings
const SaturnRings = ({ size }: { size: number }) => {
  const texture = useTexture(SATURN_RING_TEXTURE);
  
  return (
    <mesh rotation={[-Math.PI / 2 + 0.2, 0, 0]} position={[0, 0, 0]}>
      <ringGeometry args={[size * 1.2, size * 2.3, 64]} />
      <meshStandardMaterial 
        map={texture} 
        transparent 
        opacity={0.8} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
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
      // Simple rotation for visual effect
      meshRef.current.rotation.y += 0.005; 
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

  const assets = PLANET_ASSETS[planet.name];
  const isSaturn = planet.name === 'Saturn';
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
        {/* Increased geometry resolution for better normal map detail */}
        <sphereGeometry args={[planet.size, 64, 64]} />
        
        {/* Apply Texture if available */}
        {assets ? (
          <TextureErrorBoundary fallback={fallbackMaterial}>
            <Suspense fallback={fallbackMaterial}>
              <PlanetTextureMaterial name={planet.name} assets={assets} />
            </Suspense>
          </TextureErrorBoundary>
        ) : (
          fallbackMaterial
        )}

        {/* Earth Clouds */}
        {isEarth && assets?.cloudsMap && (
            <TextureErrorBoundary fallback={null}>
                <Suspense fallback={null}>
                    <PlanetClouds cloudsMap={assets.cloudsMap} size={planet.size} />
                </Suspense>
            </TextureErrorBoundary>
        )}
        
        {/* Saturn Rings */}
        {isSaturn && (
          <TextureErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <SaturnRings size={planet.size} />
            </Suspense>
          </TextureErrorBoundary>
        )}

        {/* 
          Label Config:
          Rendering in screen space (fixed pixel size).
          Shows "Earth" etc.
        */}
        <Html style={{ pointerEvents: 'none' }}>
          <div className={`group relative flex flex-col items-center transition-all duration-300 ${hovered ? 'z-50 opacity-100 scale-110' : 'z-0 opacity-60 scale-100'}`}>
            <div className={`
              px-1.5 py-0.5 rounded border backdrop-blur-[1px] transition-colors duration-300
              ${hovered ? 'bg-black/60 border-white/30 text-white' : 'bg-transparent border-transparent text-white/70'}
            `}>
              <span className="text-[10px] font-medium tracking-wider uppercase shadow-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
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
      
      {/* Bright Ambient Light for general visibility */}
      <ambientLight intensity={1.5} />
      
      {/* Point light from Sun - creates the shadows for the normal maps */}
      <pointLight position={[0,0,0]} intensity={3} distance={300} decay={0.5} color="#ffffff" />

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

      <Sun />

      <Suspense fallback={null}>
        {PLANETS.map((planet) => (
          <Planet 
            key={planet.name} 
            planet={planet} 
            daysElapsed={daysElapsed} 
            onClick={onPlanetClick}
          />
        ))}
      </Suspense>
    </Canvas>
  );
};
