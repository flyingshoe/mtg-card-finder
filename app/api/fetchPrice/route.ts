import { publicEncrypt } from "node:crypto";

const MARKETPLACE_SEARCH_URL =
  "https://thetcgmarketplace.com:3501/product/advancedfilter";
const MARKETPLACE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgGlempQY/LwZbvzeYl76yMaH/onD
/olkEmMC5rbms3BSAA/TbzPMEVjjXcKjFHcBlKC5KOAyqNF5z7VZc6hyM6GL8l4o
bNBp6LWUmeZUWFm7rsLNXIm+Sv7IOw2z/1frbyKgWagqRstIkEnmqqsgDrLJc9OS
t5FfOO99tterVzVlAgMBAAE=
-----END PUBLIC KEY-----`;

interface MarketplaceProduct {
  id: number | string;
  [key: string]: unknown;
}

interface MarketplaceResponse {
  status: 200;
  data: {
    data: MarketplaceProduct[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMarketplaceResponse(
  value: unknown,
): value is MarketplaceResponse {
  if (
    !isRecord(value) ||
    value.status !== 200 ||
    !isRecord(value.data) ||
    !Array.isArray(value.data.data)
  ) {
    return false;
  }

  return value.data.data.every(
    (product) =>
      isRecord(product) &&
      (typeof product.id === "number" || typeof product.id === "string"),
  );
}

function encodeProductId(id: number | string): string {
  return publicEncrypt(
    MARKETPLACE_PUBLIC_KEY,
    Buffer.from(String(id)),
  )
    .toString("base64")
    .replaceAll("/", "_");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? searchParams.get("s") ?? "";
  const marketplaceResponse = await fetch(MARKETPLACE_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://thetcgmarketplace.com",
    },
    body: JSON.stringify({
      category_id: "3",
      name_exact_match: 0,
      available_only: 0,
      order: "qtyAvailable_desc",
      ...(name.trim() ? { name: name.trim() } : {}),
    }),
    cache: "no-store",
  });

  const responseBody = await marketplaceResponse.text();
  if (!marketplaceResponse.ok) {
    return new Response(responseBody, {
      status: marketplaceResponse.status,
      headers: {
        "Content-Type":
          marketplaceResponse.headers.get("Content-Type") ??
          "application/json; charset=utf-8",
      },
    });
  }

  let marketplaceData: unknown;
  try {
    marketplaceData = JSON.parse(responseBody);
  } catch {
    return Response.json(
      { error: "The marketplace returned an invalid response." },
      { status: 502 },
    );
  }
  if (!isMarketplaceResponse(marketplaceData)) {
    return Response.json(
      { error: "The marketplace could not complete the card search." },
      { status: 502 },
    );
  }

  const responseWithProductLinks: MarketplaceResponse = {
    ...marketplaceData,
    data: {
      ...marketplaceData.data,
      data: marketplaceData.data.data.map((product) => ({
        ...product,
        encoded_id: encodeProductId(product.id),
      })),
    },
  };

  return Response.json(responseWithProductLinks, {
    status: marketplaceResponse.status,
  });
}
