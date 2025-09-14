import React, { FC } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  position: THREE.Vector3;
  onClose: () => void;
  onMove?: () => void;
  onDelete?: () => void;
}

export const Popup: FC<Props> = ({ position, onClose, onMove, onDelete }) => {
  return (
    <Html position={position} center>
      <div
        style={{
          background: 'white',
          border: '1px solid rgba(0,0,0,0.15)',
          borderRadius: 6,
          padding: 8,
          boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          minWidth: 100,
        }}
        // stop pointer events from falling through if you want interactive buttons
      >
        <button onClick={onMove} style={{ cursor: 'pointer' }}>
          Move
        </button>
        <button
          onClick={() => {
            onDelete?.();
            onClose();
          }}
          style={{ cursor: 'pointer' }}
        >
          Delete
        </button>
        <button onClick={onClose} style={{ cursor: 'pointer' }}>
          Close
        </button>
      </div>
    </Html>
  );
};