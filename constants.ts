import { PlanetData } from './types';

// Note: Sizes and Distances are scaled for visualization, not 1:1 reality.
// If we used real scales, planets would be invisible dots.
export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    color: "#A5A5A5",
    size: 0.38,
    distance: 10,
    period: 0.24,
    eccentricity: 0.2,
    description: "The smallest planet in our solar system and closest to the Sun."
  },
  {
    name: "Venus",
    color: "#E3BB76",
    size: 0.95,
    distance: 15,
    period: 0.62,
    eccentricity: 0.007,
    description: "Spinning in the opposite direction to most planets, Venus is the hottest planet."
  },
  {
    name: "Earth",
    color: "#22A6B3",
    size: 1,
    distance: 20,
    period: 1.00,
    eccentricity: 0.017,
    description: "Our home planet, the only place we know of so far that's inhabited by living things."
  },
  {
    name: "Mars",
    color: "#DD4B39",
    size: 0.53,
    distance: 26,
    period: 1.88,
    eccentricity: 0.09,
    description: "A dusty, cold, desert world with a very thin atmosphere."
  },
  {
    name: "Jupiter",
    color: "#D4A373",
    size: 2.5, // Scaled down slightly so it doesn't dominate the screen too much
    distance: 38,
    period: 11.86,
    eccentricity: 0.048,
    description: "More than twice as massive as all the other planets combined."
  },
  {
    name: "Saturn",
    color: "#FAFABE",
    size: 2.1,
    distance: 52,
    period: 29.45,
    eccentricity: 0.056,
    description: "Adorned with a dazzling, complex system of icy rings."
  },
  {
    name: "Uranus",
    color: "#A0E6FF",
    size: 1.6,
    distance: 68,
    period: 84.00,
    eccentricity: 0.046,
    description: "It rotates at a nearly 90-degree angle from the plane of its orbit."
  },
  {
    name: "Neptune",
    color: "#4B70DD",
    size: 1.5,
    distance: 82,
    period: 164.81,
    eccentricity: 0.01,
    description: "The first planet located through mathematical calculations rather than by telescope."
  },
  {
    name: "Pluto",
    color: "#E0Cda9",
    size: 0.25,
    distance: 95,
    period: 248.00,
    eccentricity: 0.248,
    description: "A dwarf planet in the Kuiper Belt, a ring of bodies beyond the orbit of Neptune."
  }
];

export const SIMULATION_SPEED_DEFAULT = 0.5; // Days per frame approx
