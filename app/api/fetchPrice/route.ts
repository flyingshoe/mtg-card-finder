export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Fetch the cookies before we HOOT the API
  const getCookies = await fetch("https://api.gishathfetch.com/session", {
    headers: {
      Origin: "https://gishathfetch.com",
    },
  });

  // HOOT!!!
  const getPriceRes = await fetch(
    `https://api.gishathfetch.com/search?${searchParams.toString()}`,
    {
      headers: {
        Origin: "https://gishathfetch.com",
        Cookie: getCookies.headers.get("set-cookie")?.split(";")[0] || "",
      },
    },
  );

  return new Response(getPriceRes.body);
}
