export interface PlanetData {
  name: string;
  color: string;
  size: number; // Relative size for visualization
  distance: number; // Distance from sun in simulation units
  period: number; // Orbital period in Earth years
  eccentricity: number; // Simplified eccentricity for visual interest
  description: string;
}

export interface OrbitalPosition {
  x: number;
  z: number;
}

export interface GeminiResponse {
  fact: string;
}