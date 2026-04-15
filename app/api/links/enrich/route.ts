import { NextResponse } from "next/server";
import { enrichUrl } from "@/lib/links/enrichment";

type EnrichRequest = {
  url?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnrichRequest;
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }
    const enriched = await enrichUrl(body.url);
    return NextResponse.json(enriched, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
