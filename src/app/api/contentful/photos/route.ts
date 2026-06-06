import { NextResponse } from "next/server";
import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";

export async function GET() {
  try {
    const { getPhotoGallery } = contentfulService();
    const photos = await getPhotoGallery();
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching Contentful photos:", error);
    return NextResponse.json({ error: "Failed to fetch Contentful photos" }, { status: 500 });
  }
}
