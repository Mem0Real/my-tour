export const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 10, 5]} intensity={0.5} color={'yellow'} />
    </>
  );
};
