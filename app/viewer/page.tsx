"use client";
import MtgCard from "@/app/components/Card";
import { ScryfallCard } from "@/app/components/CardFinder";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import { AttachMoney, Search } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Container,
  createTheme,
  CssBaseline,
  Drawer,
  Fab,
  TextField,
  ThemeProvider,
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const minCardVal = 3;

export default function CardViewerPage() {
  const maxCards = 75;
  const fetchingInterval = 700;
  const [rawCardList, setRawCardList] = useState("");
  const [formattedCardList, setFormattedCardList] = useState<string[]>([]);
  const [cardList, setCardList] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(true);
  const findCardsButtonRef = useRef<HTMLImageElement[]>([]);
  const [lowestPrices, setLowestPrices] = useState<{
    [key: string]: number;
  }>({});
  const [totalValue, setTotalValue] = useState(0);

  const showDrawer = () => {
    setDrawerOpened(true);
  };

  const hideDrawer = () => {
    setDrawerOpened(false);
  };

  useEffect(() => {
    const lines = rawCardList
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line) => line.trim());
    setFormattedCardList(lines);
  }, [rawCardList]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        showDrawer();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function fetchCard() {
    hideDrawer();
    setLoading(true);

    const chunkedCardList: string[][] = [];
    const noOfChunks = Math.ceil(formattedCardList.length / maxCards);

    for (let i = 0; i < noOfChunks; i++) {
      chunkedCardList.push(
        formattedCardList.slice(i * maxCards, maxCards * (i + 1))
      );
    }

    Promise.allSettled(
      chunkedCardList.map((chunk) =>
        axios.post(`https://api.scryfall.com/cards/collection`, {
          identifiers: chunk.map((cardName) => ({
            name: cardName
              .replace(/^\d+\s*/, "") // remove number + space at start
              .replace(/\[.*?\]/g, "") // remove [ ... ]
              .replace(/\(.*?\)/g, "") // remove (...)
              .replace(/\s\d+$/, "") // remove trailing number
              .replace(/\s+/g, " ") // clean up extra spaces
              .trim(),
          })),
        })
      )
    )
      .then((res) => {
        setCardList(
          res
            .filter((r) => r.status === "fulfilled")
            .map((r) => r.value.data.data)
            .flat()
        );
        setTotalValue(0);
        setLowestPrices({});
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const clickAllCards = () => {
    let actualIdx = 0;
    findCardsButtonRef.current.forEach((el) => {
      if (el && el.alt == "hidden") {
        setTimeout(() => {
          el.click();
        }, fetchingInterval * actualIdx);
        actualIdx++;
      }
    });
  };

  const handleShopListChange = (cardName: string, lowestPrice: number) => {
    const newLowestprices = { ...lowestPrices, [cardName]: lowestPrice };
    setLowestPrices(newLowestprices);

    let totalVal = 0;
    for (const card in newLowestprices) {
      if (newLowestprices[card] >= minCardVal) {
        totalVal += newLowestprices[card];
      }
    }
    setTotalValue(totalVal);
  };

  return (
    <ThemeProvider
      theme={createTheme({
        palette: {
          mode: "dark",
        },
      })}
    >
      <CssBaseline />
      <Container maxWidth={false} sx={{ backgroundColor: "action.hover" }}>
        <Drawer
          open={drawerOpened}
          onClose={hideDrawer}
          anchor="right"
          sx={{
            "& .MuiDrawer-paper": {
              backgroundColor: (theme) => `${theme.palette.background.paper}E6`,
              backdropFilter: "blur(3px)",
              minWidth: 350,
            },
          }}
        >
          <Container className="py-8">
            <div className="flex flex-col justify-between items-center">
              <TextField
                className="w-full"
                label="Paste card list here"
                multiline
                rows={20}
                value={rawCardList}
                onChange={(e) => setRawCardList(e.target.value)}
              />
              <div className="flex flex-row w-full justify-end space-x-2 mt-4">
                <Button
                  startIcon={<Search />}
                  variant="contained"
                  type="submit"
                  onClick={fetchCard}
                >
                  Find Cards
                </Button>
              </div>
            </div>
          </Container>
        </Drawer>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div className="min-h-svh grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-6">
            {cardList.map((card: ScryfallCard, idx: number) => (
              <MtgCard
                ref={(el: HTMLImageElement) => {
                  findCardsButtonRef.current[idx] = el;
                }}
                onShopListChange={handleShopListChange}
                key={card.id}
                imageSrc={
                  (card.image_uris?.normal ||
                    card?.card_faces?.[0]?.image_uris?.normal) ??
                  "images/mtg-card-back.jpeg"
                }
                cardName={card.name}
                minCardVal={minCardVal}
              />
            ))}
          </div>
        )}
        <Fab
          aria-label="search"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            backgroundColor: "black",
            "&:hover": {
              backgroundColor: "black",
              boxShadow: `0px 4px 12px rgba(255,255,255,0.5)`,
            },
          }}
          onClick={showDrawer}
        >
          <Avatar alt="MTG logo" src={"/images/mtg_logo_dark.jpg"} />
        </Fab>
        <Fab
          aria-label="fetch all cards"
          color="primary"
          sx={{
            position: "fixed",
            bottom: 86,
            right: 16,
          }}
          onClick={clickAllCards}
        >
          {totalValue == 0 ? <AttachMoney /> : formatter.format(totalValue)}
        </Fab>
      </Container>
    </ThemeProvider>
  );
}
