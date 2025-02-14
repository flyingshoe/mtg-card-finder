export default function manifest() {
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
        purpose: "any maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    theme_color: "#000000",
    background_color: "#000000",
  };
}
