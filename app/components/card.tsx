import React from "react";

export interface CardProps {
  id?: string;
  name?: string;
  cmc?: number;
  imageSrc?: string;
  linkUrl?: string;
}

export default function MtgCard({ imageSrc, linkUrl }: CardProps) {
  return (
    <img
      className="cursor-pointer duration-300 hover:scale-110 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
      src={imageSrc}
      onClick={() => window.open(linkUrl, "_blank")}
    />
  );
}
