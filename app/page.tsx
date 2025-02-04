"use client";

import {
  AppBar,
  Button,
  Checkbox,
  Container,
  Drawer,
  Fab,
  FormControlLabel,
  FormGroup,
  Pagination,
  Skeleton,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import MtgCard from "./components/card";
import { Refresh, Search } from "@mui/icons-material";
import { useState } from "react";
import axios from "axios";
import Image from "next/image";

interface SavedQueryProps {
  name: string;
  type: string;
  text: string;
  colors: string;
}

type ImageUris = {
  small: string;
  normal: string;
  large: string;
  png: string;
  art_crop: string;
  border_crop: string;
};

type RelatedCard = {
  object: "related_card";
  id: string;
  component: string;
  name: string;
  type_line: string;
  uri: string;
};

type Legalities = Record<
  | "standard"
  | "future"
  | "historic"
  | "timeless"
  | "gladiator"
  | "pioneer"
  | "explorer"
  | "modern"
  | "legacy"
  | "pauper"
  | "vintage"
  | "penny"
  | "commander"
  | "oathbreaker"
  | "standardbrawl"
  | "brawl"
  | "alchemy"
  | "paupercommander"
  | "duel"
  | "oldschool"
  | "premodern"
  | "predh",
  "legal" | "not_legal"
>;

type Prices = {
  usd: string | null;
  usd_foil: string | null;
  usd_etched: string | null;
  eur: string | null;
  eur_foil: string | null;
  tix: string | null;
};

type RelatedUris = {
  tcgplayer_infinite_articles: string;
  tcgplayer_infinite_decks: string;
  edhrec: string;
};

type CardFace = {
  object: "card_face";
  name: string;
  mana_cost: string;
  type_line: string;
  oracle_text: string;
  colors: string[];
  power?: string;
  toughness?: string;
  artist: string;
  artist_id: string;
  illustration_id: string;
  image_uris: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  color_indicator?: string[];
};

type ScryfallCard = {
  object: "card";
  id: string;
  oracle_id: string;
  multiverse_ids: number[];
  arena_id?: number;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  card_faces: CardFace[];
  image_status: string;
  image_uris: ImageUris;
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text: string;
  power?: string;
  toughness?: string;
  colors: string[];
  color_identity: string[];
  keywords: string[];
  all_parts?: RelatedCard[];
  legalities: Legalities;
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: string;
  card_back_id: string;
  artist: string;
  artist_ids: string[];
  illustration_id: string;
  border_color: string;
  frame: string;
  security_stamp?: string;
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  promo_types?: string[];
  prices: Prices;
  related_uris: RelatedUris;
};

export default function Home() {
  const [showDrawer, setShowDrawer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savedQuery, setSavedQuery] = useState<SavedQueryProps>(
    {} as SavedQueryProps
  );
  const [showPaginationBar, setShowPaginationBar] = useState(false);
  const pageSize = 175;
  const [pageNumber, setPageNumber] = useState("1");
  const [totalPages, setTotalPages] = useState(1);

  const toggleDrawer = () => {
    setShowDrawer((open) => !open);
  };

  async function fetchCard(
    { name, colors, type, text }: SavedQueryProps,
    pageNumber: string
  ) {
    setShowDrawer(false);
    setLoading(true);

    const query = [
      name,
      colors && `(id<=${colors} or id:colorless)`,
      type && `t:${type}`,
      text && `o:${text}`,
      `f:commander (game:paper)`,
    ];

    const searchParams = new URLSearchParams({
      page: pageNumber,
      order: "cmc",
      q: query.filter((el) => el).join(" "),
    });

    axios
      .get(`https://api.scryfall.com/cards/search?${searchParams}`)
      .then((res) => {
        // Based on total count, we calculate the number of pages
        const totalCount: number = parseInt(res.data.total_cards);
        const totalPages: number = Math.ceil(totalCount / pageSize);
        setTotalPages(totalPages);
        setShowPaginationBar(totalPages > 1);
        setCardList(res.data.data);
      })
      .catch(() => {
        setCardList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const [cardList, setCardList] = useState([]);
  enum MtgColors {
    WHITE = "W",
    BLACK = "B",
    GREEN = "G",
    BLUE = "U",
    RED = "R",
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: SavedQueryProps = {
      name: formData.get("name") as string,
      type: formData.get("type") as string,
      text: formData.get("text") as string,
      colors: savedQuery.colors,
    };

    setSavedQuery(data);
    setPageNumber("1"); // reset page number to 1
    fetchCard(data, "1");
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSavedQuery((prevState) => {
      let newColors = prevState.colors;
      if (checked) {
        newColors = newColors ? `${newColors}${value}` : value;
      } else {
        newColors = newColors
          .split("")
          .filter((color) => color !== value)
          .join("");
      }
      return {
        ...prevState,
        colors: newColors,
      };
    });
  };

  return (
    <Container maxWidth="xl">
      <main>
        {loading ? (
          <Container className="mt-8">
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
        ) : cardList.length == 0 && showDrawer == false ? (
          <div className="flex justify-center items-center w-full h-screen">
            <Image
              src="/images/card_not_found.webp"
              width={500}
              height={500}
              alt="card_not_found_image"
            />
          </div>
        ) : (
          <div className="flex flex-wrap justify-start mt-4">
            {cardList.map((card: ScryfallCard) => (
              <MtgCard
                key={card.id}
                imageSrc={
                  (card.image_uris?.normal ||
                    card?.card_faces?.[0]?.image_uris?.normal) ??
                  "images/mtg-card-back.jpeg"
                }
                linkUrl={card?.scryfall_uri}
              />
            ))}
            {/* Spacer */}
            <div className="h-28 w-full"></div>
          </div>
        )}

        <Drawer
          open={showDrawer}
          onClose={toggleDrawer}
          anchor="top"
          sx={{
            "& .MuiDrawer-paper": {
              backgroundColor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(3px)",
            },
          }}
        >
          <Container className="py-8">
            <Typography variant="h4" gutterBottom color="info">
              MTG Card Finder
            </Typography>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap md:space-x-8">
                <TextField
                  label="Card Name"
                  name="name"
                  className="w-full sm:w-full md:w-auto"
                  sx={{
                    marginBottom: 2,
                  }}
                  defaultValue={savedQuery.name}
                />
                <TextField
                  label="Card Type"
                  name="type"
                  className="w-full sm:w-full md:w-auto"
                  sx={{
                    marginBottom: 2,
                  }}
                  defaultValue={savedQuery.type}
                />
                <TextField
                  label="Card Text"
                  name="text"
                  className="w-full sm:w-full md:w-auto"
                  sx={{
                    marginBottom: 2,
                  }}
                  defaultValue={savedQuery.text}
                />
              </div>

              <FormGroup row>
                {Object.keys(MtgColors).map((color) => (
                  <FormControlLabel
                    key={color}
                    control={
                      <Checkbox
                        size="large"
                        onChange={handleColorChange}
                        checked={
                          savedQuery.colors?.includes(
                            MtgColors[color as keyof typeof MtgColors]
                          ) ?? false
                        }
                      />
                    }
                    label={
                      <Image
                        src={`/images/${color.toLowerCase()}_mana.svg`}
                        width={40}
                        height={40}
                        alt={`${color}_mana_icon`}
                      />
                    }
                    value={MtgColors[color as keyof typeof MtgColors]}
                  />
                ))}
              </FormGroup>

              <div className="flex flex-row justify-end space-x-4 mt-4">
                <div>
                  <Button
                    startIcon={<Refresh />}
                    onClick={() => {
                      setSavedQuery({} as SavedQueryProps);
                      toggleDrawer();
                      setTimeout(() => {
                        toggleDrawer();
                      }, 300);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    startIcon={<Search />}
                    variant="contained"
                    type="submit"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>
          </Container>
        </Drawer>
        <Fab
          aria-label="search"
          sx={{
            position: "fixed",
            bottom: showPaginationBar ? 72 : 16,
            right: 16,
            backgroundColor: "rgb(170, 224, 250)",
            "&:hover": {
              backgroundColor: "rgb(170, 224, 250)",
            },
          }}
          onClick={toggleDrawer}
        >
          <Image
            src={`/images/blue_mana.svg`}
            width={40}
            height={40}
            alt={`mtg_icon`}
          />
        </Fab>
      </main>
      <footer>
        {showPaginationBar && (
          <AppBar
            position="fixed"
            sx={{
              top: "auto",
              bottom: 0,
              backgroundColor: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(3px)",
            }}
          >
            <Toolbar className="flex justify-center">
              <Pagination
                color="primary"
                count={totalPages}
                page={parseInt(pageNumber)}
                onChange={(_, pageNo) => {
                  const newPageNo = pageNo.toString();
                  setPageNumber(newPageNo);
                  fetchCard(savedQuery, newPageNo);
                }}
              />
            </Toolbar>
          </AppBar>
        )}
      </footer>
    </Container>
  );
}
