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
      className="rounded-2xl cursor-pointer duration-300 hover:scale-110"
      src={imageSrc}
      onClick={() => window.open(linkUrl, "_blank")}
    />
  );
}
