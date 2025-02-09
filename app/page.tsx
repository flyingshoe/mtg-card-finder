import CardFinder from "@/app/components/CardFinder";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CardFinder />
    </Suspense>
  );
}
