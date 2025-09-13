import { Grid } from '@react-three/drei';

export const dashboard = () => {
  return (
    <>
      <Grid
        renderOrder={-1}
        position={[0, 0.01, 0]}
        cellSize={1}
        sectionSize={1}
        sectionColor={'#D0D0CF'}
        sectionThickness={1}
        infiniteGrid={true}
      />
    </>
  );
};
