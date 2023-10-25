export const calcAngularVelocity = (
  initialVelocity: number,
  startTime: number,
) => {
  const decayConstant = 0.1;
  const time = (performance.now() - startTime) * 0.001;
  return initialVelocity * Math.exp(-decayConstant * time);
};
