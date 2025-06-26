import { detectRecommendedBump } from '../utils/detectRecommendedBump.js';

export async function handleDetectBump() {
  const type = await detectRecommendedBump();

  console.log(type);
}
