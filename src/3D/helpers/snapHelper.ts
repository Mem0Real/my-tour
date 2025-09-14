import * as THREE from 'three';

const snapDistance = 0.01;
const straightThreshold = 0.08;
const snapTolerance = 0.15;

export const magneticSnap = (point: THREE.Vector3, last?: THREE.Vector3, first?: THREE.Vector3) => {
  // Magnetic snap to nearest grid line
  // const gx = Math.round(snapped.x);
  // const gz = Math.round(snapped.z);

  // if (Math.abs(snapped.x - gx) < snapDistance) {
  //   snapped.x = gx;
  // }
  // if (Math.abs(snapped.z - gz) < snapDistance) {
  //   snapped.z = gz;
  // }

  const snapped = point.clone();

  // Straighten relative to last point
  if (last) {
    const dx = snapped.x - last.x;
    const dz = snapped.z - last.z;

    // almost horizontal
    if (Math.abs(dz) < straightThreshold) {
      snapped.z = last.z;
    }
    // almost vertical
    if (Math.abs(dx) < straightThreshold) {
      snapped.x = last.x;
    }
  }

  if (first) {
    if (Math.abs(snapped.x - first.x) < snapTolerance) {
      snapped.x = first.x;
    }
    if (Math.abs(snapped.z - first.z) < snapTolerance) {
      snapped.z = first.z;
    }
  }

  return snapped;
};
