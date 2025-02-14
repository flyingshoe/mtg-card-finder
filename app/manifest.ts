import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MTG Card Finder",
    short_name: "MTG Finder",
    description: "Made this because the official app sucks",
    start_url: "/",
    display: "standalone",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: "#000000",
    background_color: "#000000",
  };
}
