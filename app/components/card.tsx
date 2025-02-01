import React from "react";

export interface CardProps {
  id?: string;
  name?: string;
  cmc?: number;
  imageUrl?: string;
  multiverseid?: string;
}

export default function MtgCard({ imageUrl, multiverseid }: CardProps) {
  return (
    <img
      className="cursor-pointer duration-300 hover:scale-110 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2"
      src={imageUrl}
      onClick={() =>
        window.open(
          `https://gatherer.wizards.com/pages/card/Details.aspx?multiverseid=${multiverseid}`,
          "_blank"
        )
      }
    />
  );
}
