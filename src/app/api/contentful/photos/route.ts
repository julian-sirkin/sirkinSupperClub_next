import { NextResponse } from "next/server";
import { contentfulService } from "@/app/networkCalls/contentful/contentfulService";
import { isAdminRequest, unauthorizedAdminResponse } from "../../utils/isAdminRequest";

export async function GET(request: Request) {
  if (!(await isAdminRequest(request))) {
    return unauthorizedAdminResponse();
  }

  try {
    const { getPhotoGallery } = contentfulService();
    const photos = await getPhotoGallery();
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error fetching Contentful photos:", error);
    return NextResponse.json({ error: "Failed to fetch Contentful photos" }, { status: 500 });
  }
}
