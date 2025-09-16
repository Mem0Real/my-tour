import React, { useMemo } from 'react';
import { EndpointRef, JointProps } from '@/utils/definitions';
import * as THREE from 'three';
import { makeTriangleGeometry } from '@/3D/helpers/snapHelper';

export const WallJoints = ({
  id,
  start,
  end,
  thickness = 0.1,
  height = 2.5,

  onHoverEndpoint,
  onClickEndpoint,

  hoveredEndpoint,
}: JointProps) => {
  const half = thickness * 10;

  // Compute corners at endpoint but oriented along wall
  // Axes: - far = normalized direction away from endpoint along the wall
  //        - perp = perpendicular (right) vector

  const computeSquareCorners = (endPoint: THREE.Vector3, outward: THREE.Vector3) => {
    const far = outward.clone().normalize(); // along wall away from endpoint
    const perp = new THREE.Vector3(-far.z, 0, far.x).normalize();

    // corners of square relative to endpoint in xz plane
    const c1 = endPoint.clone().add(far.clone().multiplyScalar(half)).add(perp.clone().multiplyScalar(half)); // +far +perp
    const c2 = endPoint.clone().add(far.clone().multiplyScalar(-half)).add(perp.clone().multiplyScalar(half)); // -far +perp
    const c3 = endPoint.clone().add(far.clone().multiplyScalar(-half)).add(perp.clone().multiplyScalar(-half)); // -far -perp
    const c4 = endPoint.clone().add(far.clone().multiplyScalar(half)).add(perp.clone().multiplyScalar(-half)); // +far -perp
    return [c1, c2, c3, c4] as const;
  };

  // Choose diagonal index deterministically from direction angle
  // quadrant = floor((angleNormalized) / (PI/2))
  // diagIndex = quadrant % 2 => alternating diagonals across quadrants

  const diagIndexForDir = (dir: THREE.Vector3) => {
    let angle = Math.atan2(dir.z, dir.x);
    if (angle < 0) angle += Math.PI * 2; // [0, 2PI]

    const quadrant = Math.floor(angle / (Math.PI / 2)); // 0...3
    return quadrant % 2; // 0 | 1
  };

  const triangleForEndpoint = (endPoint: THREE.Vector3, outward: THREE.Vector3) => {
    // compute corners
    const [c1, c2, c3, c4] = computeSquareCorners(endPoint, outward);
    const diagIndex = diagIndexForDir(outward); // 0 => use [c1, c3], 1 => use [c2, c4]

    const y = height + 2;
    c1.y = y;
    c2.y = y;
    c3.y = y;
    c4.y = y;

    if (diagIndex === 0) return makeTriangleGeometry(endPoint.clone().setY(y), c1, c3);
    else return makeTriangleGeometry(endPoint.clone().setY(y), c2, c4);
  };

  // Precompute geometries for start & end triangles (outward direction varies)
  // For start endpoint outward is (end -> start)
  const startOut = useMemo(() => new THREE.Vector3().subVectors(end, start).setY(0), [start, end]);
  const endOut = useMemo(() => new THREE.Vector3().subVectors(start, end).setY(0), [start, end]);

  const startTriangleGeometry = useMemo(() => triangleForEndpoint(start, startOut), [start, end, thickness, height]);
  const endTriangleGeometry = useMemo(() => triangleForEndpoint(end, endOut), [start, end, thickness, height]);

  // Hover check (unique endpoint ref)
  const isHovered = (endPoint: EndpointRef | null, which: 0 | 1) =>
    !!endPoint && endPoint.wallIndex === id && endPoint.pointIndex === which;

  return (
    // <>
    //   {/* Start endpoint */}
    //   <mesh
    //     geometry={startTriangleGeometry}
    //     onPointerOver={() => onHoverEndpoint?.({ wallIndex: id, pointIndex: 0 })}
    //     onPointerOut={() => onHoverEndpoint?.(null)}
    //     onClick={() => onClickEndpoint?.({ wallIndex: id, pointIndex: 0 })}
    //   >
    //     <meshStandardMaterial color={'yellow'} visible={isHovered(hoveredEndpoint!, 0)} side={THREE.DoubleSide} />
    //   </mesh>

    //   {/* End endpoint */}
    //   <mesh
    //     geometry={endTriangleGeometry}
    //     onPointerOver={() => onHoverEndpoint?.({ wallIndex: id, pointIndex: 1 })}
    //     onPointerOut={() => onHoverEndpoint?.(null)}
    //     onClick={() => onClickEndpoint?.({ wallIndex: id, pointIndex: 1 })}
    //   >
    //     <meshStandardMaterial color={'yellow'} visible={isHovered(hoveredEndpoint!, 1)} side={THREE.DoubleSide} />
    //   </mesh>
    // </>

    <>
      <mesh geometry={startTriangleGeometry}>
        <meshBasicMaterial
          color='red'
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
      <mesh geometry={endTriangleGeometry}>
        <meshBasicMaterial
          color='red'
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
    </>
  );
};
