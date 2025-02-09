import { Container, Skeleton } from "@mui/material";

const LoadingSkeleton = () => {
  return (
    <Container className="w-full h-svh pt-8">
      <Skeleton width="100%" />
      <Skeleton width="90%" />
      <Skeleton width="80%" />
      <Skeleton width="90%" />
      <Skeleton width="70%" />
      <Skeleton width="60%" />
      <Skeleton width="80%" />
      <Skeleton width="90%" />
      <Skeleton width="70%" />
      <Skeleton width="60%" />
    </Container>
  );
};
export default LoadingSkeleton;
