"use client";

import {
  AppBar,
  Autocomplete,
  Avatar,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  createTheme,
  CssBaseline,
  Drawer,
  Fab,
  FormControlLabel,
  FormGroup,
  Pagination,
  styled,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import { Refresh, Search } from "@mui/icons-material";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSkeleton from "@/app/components/LoadingSkeleton";
import MtgCard from "@/app/components/Card";
import { MtgTextField } from "@/app/components/MtgTextField";
import Link from "next/link";

interface SavedQueryProps {
  [key: string]: string; // Or `any` if values can have different types
  name: string;
  type: string;
  text: string;
  colors: string;
  colorless: string;
  showLands: string;
  commander: string;
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

export type ScryfallCard = {
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

const DarkModeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: "#aab4be",
        ...theme.applyStyles("dark", {
          backgroundColor: "#8796A5",
        }),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#001e3c",
    width: 32,
    height: 32,
    "&::before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        "#fff"
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles("dark", {
      backgroundColor: "#003892",
    }),
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: "#aab4be",
    borderRadius: 20 / 2,
    ...theme.applyStyles("dark", {
      backgroundColor: "#8796A5",
    }),
  },
}));

export default function CardFinder() {
  const [drawerOpened, setDrawerOpened] = useState(true);
  const [loading, setLoading] = useState(false);
  const defaultState: SavedQueryProps = {
    name: "",
    type: "",
    text: "",
    colors: "",
    colorless: "false",
    showLands: "true",
    commander: "true",
  };
  const [savedQuery, setSavedQuery] = useState<SavedQueryProps>(defaultState);
  const [showPaginationBar, setShowPaginationBar] = useState(false);
  const pageSize = 175;
  const [pageNumber, setPageNumber] = useState("1");
  const [totalPages, setTotalPages] = useState(1);

  const showDrawer = () => {
    setDrawerOpened(true);
  };

  const hideDrawer = () => {
    setDrawerOpened(false);
  };

  function generateColorQuery(colors: string, colorless: string) {
    if (colors && colorless == "true") {
      return `(id<=${colors} or id:colorless)`;
    }
    if (colors) {
      return `id<=${colors} -id:colorless`;
    }
    if (colorless == "true") {
      return "id:colorless";
    }
    return "";
  }

  async function fetchCard(
    {
      name,
      colors,
      type,
      text,
      colorless,
      showLands,
      commander,
    }: SavedQueryProps,
    pageNumber: string
  ) {
    hideDrawer();
    setLoading(true);

    // Extracts all regex then splits the remaining string into words, returns an array of strings
    const parseString = (input: string) => {
      return [
        ...(input.match(/\/[^/]+\/+/g) || []), // this line is to add in all regex
        ...input
          .replace(/\/[^/]+\/+/g, "")
          .trim() // remove those added regex
          .split(/\s+/)
          .filter(Boolean),
      ];
    };

    const query = [
      name,
      generateColorQuery(colors, colorless),
      type &&
        `(${parseString(type)
          .map((q) => `t:${q}`)
          .join(" ")})`,
      text &&
        `(${parseString(text)
          .map((q) => `o:${q}`)
          .join(" ")})`,
      showLands != "true" && "-t:land",
      commander == "true" && "f:commander",
      "(game:paper)",
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
        setShowPaginationBar(false);
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
      colorless: savedQuery.colorless,
      showLands: savedQuery.showLands,
      commander: savedQuery.commander,
    };

    setSavedQuery(data);
    setPageNumber("1"); // reset page number to 1
    fetchCard(data, "1");
    setParams(data);
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

  const [darkMode, setDarkMode] = useState(false);
  // Read from localstorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("darkMode") === "true") {
        setDarkMode(true);
      }
    }
  }, []);

  // Save to localstorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("darkMode", darkMode.toString());
    }
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  // Search parameters
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    getParams();
  }, [searchParams]);

  const getParams = () => {
    const queryObject: SavedQueryProps = {} as SavedQueryProps;
    for (const [key, value] of searchParams.entries()) {
      queryObject[key] = value;
    }
    setSavedQuery({ ...defaultState, ...queryObject });
    if (Object.keys(queryObject).length > 0) {
      setTimeout(() => {
        fetchCard({ ...defaultState, ...queryObject }, "1");
      }, 100);
    }
  };

  const setParams = (latestSavedQuery: SavedQueryProps) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(latestSavedQuery)) {
      if (value?.trim() !== "") {
        params.set(key, value);
      }
    }
    router.push(`?${params.toString()}`);
  };

  const resetParams = () => {
    router.push("/");
  };

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

  const [open, setOpen] = useState(false);
  const [autocompleteList, setAutocompleteList] = useState<readonly string[]>(
    []
  );
  const [loadingAutocomplete, setLoadingAutocomplete] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null); // Create a ref to store the timeout

  const onAutocomplete = async (cardName: string) => {
    setLoadingAutocomplete(true);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current); // Clear the previous timeout if it exists
    }

    debounceTimeout.current = setTimeout(() => {
      axios
        .get("https://api.scryfall.com/cards/autocomplete", {
          params: {
            q: cardName,
          },
        })
        .then((res) => {
          setAutocompleteList([...res.data.data]);
        })
        .finally(() => {
          setLoadingAutocomplete(false);
        });
    }, 400); // Adjust the debounce delay
  };

  const handleCloseAutocomplete = () => {
    setOpen(false);
    setAutocompleteList([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} sx={{ backgroundColor: "action.hover" }}>
        <main>
          {loading ? (
            <LoadingSkeleton />
          ) : cardList.length == 0 && drawerOpened == false ? (
            <div className="flex justify-center items-center w-full h-dvh">
              <Link href="/viewer">
                <Image
                  src="/images/card_not_found.webp"
                  width={500}
                  height={500}
                  alt="card_not_found_image"
                />
              </Link>
            </div>
          ) : (
            <>
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
              {/* Spacer */}
              <div className="h-24 w-full"></div>
            </>
          )}
          <Drawer
            open={drawerOpened}
            onClose={hideDrawer}
            anchor="top"
            sx={{
              "& .MuiDrawer-paper": {
                backgroundColor: (theme) =>
                  `${theme.palette.background.paper}E6`,
                backdropFilter: "blur(3px)",
              },
            }}
          >
            <Container className="py-8">
              <div className="flex justify-between items-center">
                <Typography variant="h4" gutterBottom color="primary.main">
                  <span className="hidden sm:block">
                    MTG Commander Card Finder
                  </span>
                  <span className="block sm:hidden">MTG Card Finder</span>
                </Typography>
                <DarkModeSwitch
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-wrap md:space-x-8">
                  <Autocomplete
                    className="w-full sm:w-full md:w-56"
                    freeSolo
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={handleCloseAutocomplete}
                    isOptionEqualToValue={(option, value) => option === value}
                    getOptionLabel={(option) => option}
                    options={autocompleteList}
                    loading={loadingAutocomplete}
                    value={savedQuery.name}
                    renderInput={(params) => (
                      <MtgTextField
                        params={params}
                        label="Card Name"
                        name="name"
                        onChange={(e) => {
                          setSavedQuery((q) => ({
                            ...q,
                            name: e.target.value,
                          }));
                          onAutocomplete(e.target.value);
                        }}
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loadingAutocomplete ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          },
                        }}
                      />
                    )}
                  />

                  <MtgTextField
                    label="Card Type"
                    name="type"
                    value={savedQuery.type}
                    onChange={(e) => {
                      setSavedQuery((q) => ({ ...q, type: e.target.value }));
                    }}
                  />
                  <MtgTextField
                    label="Card Text"
                    name="text"
                    value={savedQuery.text}
                    onChange={(e) => {
                      setSavedQuery((q) => ({ ...q, text: e.target.value }));
                    }}
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="large"
                        checked={savedQuery.colorless == "true"}
                        name="colorless"
                        onChange={(e) => {
                          setSavedQuery((prevState) => {
                            return {
                              ...prevState,
                              colorless: e.target.checked.toString(),
                            };
                          });
                        }}
                      />
                    }
                    label={
                      <Image
                        src="/images/colorless_mana.svg"
                        width={40}
                        height={40}
                        alt="colorless_mana_icon"
                      />
                    }
                  />
                </FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="large"
                      checked={savedQuery.showLands == "true"}
                      name="showLands"
                      onChange={(e) => {
                        setSavedQuery((prevState) => {
                          return {
                            ...prevState,
                            showLands: e.target.checked.toString(),
                          };
                        });
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="h5"
                      color={savedQuery.showLands ? "primary" : ""}
                      sx={{ userSelect: "none" }}
                    >
                      Show Lands
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      size="large"
                      checked={savedQuery.commander == "true"}
                      name="commander"
                      onChange={(e) => {
                        setSavedQuery((prevState) => {
                          return {
                            ...prevState,
                            commander: e.target.checked.toString(),
                          };
                        });
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="h5"
                      color={savedQuery.commander ? "primary" : ""}
                      sx={{ userSelect: "none" }}
                    >
                      Commander Only
                    </Typography>
                  }
                />
                <div className="flex flex-row justify-end space-x-2 mt-4">
                  <Button
                    color="primary"
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => {
                      setSavedQuery(defaultState);
                      hideDrawer();
                      setTimeout(() => {
                        showDrawer();
                      }, 300);
                      resetParams();
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
              </form>
            </Container>
          </Drawer>
          <Fab
            aria-label="search"
            sx={{
              position: "fixed",
              bottom: showPaginationBar ? 72 : 16,
              right: 16,
              backgroundColor: "black",
              "&:hover": {
                backgroundColor: "black",
                boxShadow: `0px 4px 12px ${
                  darkMode ? "rgba(255,255,255,0.5)" : "black"
                }`,
              },
            }}
            onClick={showDrawer}
          >
            <Avatar alt="MTG logo" src={"/images/mtg_logo_dark.jpg"} />
          </Fab>
        </main>
        <footer>
          {showPaginationBar && (
            <AppBar
              position="fixed"
              sx={{
                top: "auto",
                bottom: 0,
                backgroundColor: (theme) =>
                  `${theme.palette.background.paper}D9`,
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
    </ThemeProvider>
  );
}
