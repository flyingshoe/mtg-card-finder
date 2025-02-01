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
import MtgCard, { CardProps } from "./components/card";
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

export default function Home() {
  const [showDrawer, setShowDrawer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savedQuery, setSavedQuery] = useState<SavedQueryProps>(
    {} as SavedQueryProps
  );
  const [showPaginationBar, setShowPaginationBar] = useState(false);
  const [pageSize, setPageSize] = useState("20");
  const [pageNumber, setPageNumber] = useState("1");
  const [totalPages, setTotalPages] = useState(1);

  const toggleDrawer = () => {
    setShowDrawer((open) => !open);
  };

  async function fetchCard(searchQuery: SavedQueryProps, pageNumber: string) {
    setShowDrawer(false);
    setLoading(true);

    axios
      .get(
        `https://api.magicthegathering.io/v1/cards?${new URLSearchParams(
          Object.entries(searchQuery).reduce(
            (acc, [key, value]) => {
              if (value) acc[key] = value;
              return acc;
            },
            {
              contains: "imageUrl",
              pageSize: pageSize,
              page: pageNumber,
            } as Record<string, string>
          )
        ).toString()}`
      )
      .then((res) => {
        // Based on total count, we calculate the number of pages
        const totalCount: number = parseInt(res.headers["total-count"]);
        const totalPages: number = Math.ceil(totalCount / parseInt(pageSize));

        setTotalPages(totalPages);
        setShowPaginationBar(totalPages > 1);

        const seen = new Set();
        const filteredList = res.data.cards
          .filter((card: CardProps) => {
            if (seen.has(card.name)) return false;
            seen.add(card.name);
            return true;
          })
          .sort((a: CardProps, b: CardProps) => (a.cmc ?? 0) - (b.cmc ?? 0));

        setCardList(filteredList);
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
        newColors = newColors ? `${newColors}|${value}` : value;
      } else {
        newColors = newColors
          .split("|")
          .filter((color) => color !== value)
          .join("|");
      }
      return {
        ...prevState,
        colors: newColors,
      };
    });
  };

  return (
    <Container maxWidth="xl">
      <main className="flex flex-wrap justify-start">
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
        ) : (
          cardList.map((card: CardProps) => (
            <MtgCard
              key={card.id}
              imageUrl={card.imageUrl}
              multiverseid={card.multiverseid}
            />
          ))
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
              <div className="flex flex-row justify-end space-x-4">
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
