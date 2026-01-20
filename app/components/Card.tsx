import { Cancel } from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import Image from "next/image";
import React, { FC, useEffect, useState } from "react";

export type CardFaces = {
  name: string;
  image_uris: {
    normal: string;
  };
};
export interface CardProps {
  id?: string;
  name?: string;
  cmc?: number;
  imageSrc: string;
  cardName: string;
  ref?: React.Ref<HTMLImageElement | null>;
  onShopListChange?: (cardName: string, lowestPrice: number) => void;
  minCardVal?: number;
  showAllShops?: boolean;
  cardFaces?: CardFaces[] | null;
}

interface ShopItemProps {
  name: string;
  url: string;
  img: string;
  price: number;
  inStock: boolean;
  src: string;
  quality: string;
  extraInfo: string;
}

const maxCards = 4;
const allShops = [
  "5 Mana",
  "Agora Hobby",
  "Arcane Sanctum",
  "Card Affinity",
  "Cardboard Crack Games",
  "Cards Citadel",
  "Cards & Collections",
  "Dueller's Point",
  "Flagship Games",
  "Games Haven",
  "Grey Ogre Games",
  "Hideout",
  "Mana Pro",
  "Mox & Lotus",
  "MTG Asia",
  "OneMtg",
  "Tefuda",
  "The TCG Marketplace",
  "Unsleeved",
];

const myShops = [
  "5 Mana",
  "Agora Hobby",
  "Arcane Sanctum",
  "Card Affinity",
  "Cardboard Crack Games",
  "Cards Citadel",
  "Cards & Collections",
  "Dueller's Point",
  "Flagship Games",
  "Games Haven",
  "Grey Ogre Games",
  "Hideout",
  "Mana Pro",
  "Mox & Lotus",
  "MTG Asia",
  "OneMtg",
  "Tefuda",
  "The TCG Marketplace",
  "Unsleeved",
];

const transformLogoUrl =
  "data:image/png;base64,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";

const CardOverlayIcon: FC<{ image?: string; url: string }> = ({ image }) => {
  return (
    <img
      className="rounded-xl hover:scale-110 duration-300 h-full"
      src={
        image ||
        "data:image/webp;base64,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"
      }
    />
  );
};

export default function MtgCard({
  imageSrc,
  cardName,
  ref,
  onShopListChange,
  minCardVal,
  showAllShops = false,
  cardFaces,
}: CardProps) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [shopList, setShopList] = useState<ShopItemProps[]>([]);
  const [loading, setLoading] = useState(false);
  const [displaySrc, setDisplaySrc] = useState(
    cardFaces?.[0].image_uris?.normal ?? imageSrc,
  );
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    onShopListChange?.(cardName, showOverlay ? (shopList[0]?.price ?? 0) : 0);
  }, [shopList]);

  const fetchLowestPrice = (cardName: string) => {
    setLoading(true);

    axios
      .get("/lowest-price", {
        params: {
          s: cardName,
          lgs: showAllShops ? allShops.join(",") : myShops.join(","),
        },
      })
      .then((res) => {
        setLoading(false);

        // No Card found, show card not found message
        if (res.data.data == null) {
          setShopList([]);
        } else {
          const myShopList: React.SetStateAction<ShopItemProps[]> = [];
          const orderedResponse = res.data.data
            .filter(
              (card: ShopItemProps) => card.name == cardName && card.inStock,
            )
            .sort((a: ShopItemProps, b: ShopItemProps) => a.price - b.price); // Sort by price in ascending order

          orderedResponse.forEach((shop: ShopItemProps, idx: number) => {
            if (idx == 0) {
              myShopList.push(shop);
            } else if (myShopList.length < maxCards) {
              myShopList.push(shop);
            }
          });

          setShopList(myShopList);
        }
      })
      .catch(() => {
        setLoading(false);
        setShowOverlay(false);
      });
  };

  const CardOverlay = () => {
    return (
      <div
        className={`absolute inset-0 cursor-pointer rounded-xl  bg-black bg-opacity-70 flex flex-col items-center justify-center gap-6 ${
          minCardVal &&
          shopList[0]?.price >= minCardVal &&
          "border-4 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.9)]"
        }`}
      >
        <button
          className="absolute top-2 right-2 duration-300 hover:shadow-[0px_0px_15px_white] rounded-full z-10"
          onClick={() => {
            setShowOverlay(false);
            onShopListChange?.(cardName, 0);
          }}
        >
          <Cancel sx={{ color: "white" }} />
        </button>
        {loading ? (
          <CircularProgress />
        ) : shopList.length <= 0 ? (
          <div>Card not sold</div>
        ) : (
          <div className={`grid grid-cols-2 grid-rows-2 gap-1 h-full w-full`}>
            {shopList.map((shop, index) => (
              <div
                key={index}
                className="w-full h-full relative"
                onClick={() => {
                  const url = new URL(shop.url);
                  url.searchParams.delete("utm_source");
                  window.open(url, "_blank");
                }}
              >
                <CardOverlayIcon image={shop.img} url={shop.url} />
                <div className="rounded-md p-1 absolute bg-black bg-opacity-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="text-white text-sm text-center">
                    {shop.src}
                  </div>
                  <div className="text-white text-sm text-center">
                    $ {shop.price}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="relative">
        <div
          className="inline-block"
          style={{
            transform: isFlipping
              ? "scale(0.85) rotate(4deg)"
              : "scale(1) rotate(0deg)",
            opacity: isFlipping ? 0 : 1,
            transition:
              "transform 250ms ease-in-out, opacity 250ms ease-in-out",
          }}
        >
          <Image
            ref={ref}
            unoptimized
            className="rounded-2xl cursor-pointer sm:hover:scale-110 duration-300"
            alt={showOverlay ? "shown" : "hidden"}
            src={displaySrc}
            blurDataURL="data:image/webp;base64,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"
            placeholder="blur"
            width={1000}
            height={1400}
            onClick={() => {
              fetchLowestPrice(cardName);
              setShowOverlay(true);
            }}
          />
        </div>
        {cardFaces != null && (
          <Image
            unoptimized
            className="rounded-full cursor-pointer absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            alt="Transform card logo"
            src={transformLogoUrl}
            width={50}
            height={50}
            onClick={() => {
              setIsFlipping(true);
              setTimeout(() => {
                setDisplaySrc((currentSrc) => {
                  const [front, back] = cardFaces;

                  if (!front || !back) return imageSrc;

                  const isFront = currentSrc === front.image_uris?.normal;
                  const nextFace = isFront ? back : front;

                  return nextFace.image_uris?.normal ?? imageSrc;
                });
                setIsFlipping(false);
              }, 220);
            }}
          />
        )}
        {showOverlay && (
          <div className="absolute inset-0 h-full">
            <CardOverlay />
          </div>
        )}
      </div>
    </div>
  );
}
