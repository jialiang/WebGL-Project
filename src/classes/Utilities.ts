export const MathMap = (
  x: number,
  xMin: number,
  xMax: number,
  zMin: number,
  zMax: number
): number => ((x - xMin) / (xMax - xMin)) * (zMax - zMin) + zMin;
