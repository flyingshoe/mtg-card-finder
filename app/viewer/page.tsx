"use client";
import MtgCard from "@/app/components/Card";
import { ScryfallCard } from "@/app/components/CardFinder";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import { Search } from "@mui/icons-material";
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
import { useEffect, useState } from "react";

export default function CardViewerPage() {
  const [rawCardList, setRawCardList] = useState("");
  const [formattedCardList, setFormattedCardList] = useState<string[]>([]);
  const [cardList, setCardList] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(true);

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

  async function fetchCard() {
    hideDrawer();
    setLoading(true);

    axios
      .post(`https://api.scryfall.com/cards/collection`, {
        identifiers: formattedCardList.map((cardName) => ({
          name: cardName,
        })),
      })
      .then((res) => {
        setCardList(res.data.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }

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
          anchor="top"
          sx={{
            "& .MuiDrawer-paper": {
              backgroundColor: (theme) => `${theme.palette.background.paper}E6`,
              backdropFilter: "blur(3px)",
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
            {cardList.map((card: ScryfallCard) => (
              <MtgCard
                key={card.id}
                imageSrc={
                  (card.image_uris?.normal ||
                    card?.card_faces?.[0]?.image_uris?.normal) ??
                  "images/mtg-card-back.jpeg"
                }
                cardName={card.name}
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
      </Container>
    </ThemeProvider>
  );
}
