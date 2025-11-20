import { PlanetData } from '../types';

/**
 * Calculates the 2D position (x, z) of a planet on the orbital plane.
 * We use a simplified orbital model for visualization purposes.
 * 
 * @param planet The planet data object
 * @param daysOffset The number of Earth days passed since the epoch
 * @returns [x, y, z] coordinates (y is typically 0 or slightly inclined)
 */
export const calculatePlanetPosition = (planet: PlanetData, daysOffset: number): [number, number, number] => {
  // Convert period from years to days
  const periodInDays = planet.period * 365.25;
  
  // Calculate mean anomaly (angle in radians)
  // (2 * Math.PI * daysOffset) / periodInDays
  const angle = (daysOffset / periodInDays) * 2 * Math.PI;

  // Simple elliptical approximation (not full Keplerian for visual simplicity)
  // We apply eccentricity to stretch the orbit slightly
  const a = planet.distance; // Semi-major axis
  const b = planet.distance * Math.sqrt(1 - planet.eccentricity ** 2); // Semi-minor axis
  
  // Use an offset center based on eccentricity to simulate focus
  const focusOffset = planet.distance * planet.eccentricity;

  const x = a * Math.cos(angle) - focusOffset;
  const z = b * Math.sin(angle);

  return [x, 0, z];
};
