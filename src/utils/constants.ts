export enum CameraTypes {
  PERSPECTIVE,
  ORTHOGRAPHIC,
  FPS,
}

export enum CursorTypes {
  DEFAULT = 'auto',
  CROSS = 'crosshair',
  POINTER = 'pointer',
  GRAB = 'grab',
  GRABBING = 'grabbing',
  PENCIL = 'url("/pencil.svg") 0 24, auto',
}

export const WALL_THICKNESS = 0.1;
export const WALL_HEIGHT = 2.5;
export const SNAP_DISTANCE = 0.3;
export const STRAIGHT_THRESHOLD = 0.1;
export const SNAP_TOLERANCE = 0.3;
