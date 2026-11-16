import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Recipe ID is required." },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(id)}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: "Unable to fetch recipe from TheMealDB." },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      return NextResponse.json(
        { message: "Recipe not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Recipe API Error:", error);

    return NextResponse.json(
      { message: "Unable to connect to TheMealDB. Please try again." },
      { status: 500 }
    );
  }
}