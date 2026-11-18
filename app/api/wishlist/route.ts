import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET WISHLIST
export async function GET(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const items = await prisma.wishlistItem.findMany({
      where: {
        wishlist: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        price: item.price ? Number(item.price) : null,
      })),
    });
  } catch (error) {
    console.error("Wishlist fetch error:", error);

    return NextResponse.json(
      { message: "Unable to fetch wishlist." },
      { status: 500 }
    );
  }
}

// ADD TO WISHLIST
export async function POST(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const idMeal = String(body.idMeal || "").trim();
    const name = String(body.strMeal || "").trim();
    const image = String(body.strMealThumb || "");
    const category = body.strCategory
      ? String(body.strCategory)
      : null;

    const price = Number(body.price);

    if (!idMeal || !name) {
      return NextResponse.json(
        { message: "Invalid recipe details." },
        { status: 400 }
      );
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    const item = await prisma.wishlistItem.upsert({
      where: {
        wishlistId_idMeal: {
          wishlistId: wishlist.id,
          idMeal,
        },
      },
      create: {
        wishlistId: wishlist.id,
        idMeal,
        name,
        image,
        category,
        price:
          Number.isFinite(price) && price > 0
            ? price
            : null,
      },
      update: {
        name,
        image,
        category,
        price:
          Number.isFinite(price) && price > 0
            ? price
            : null,
      },
    });

    return NextResponse.json(
      {
        message: "Recipe added to wishlist.",
        item: {
          ...item,
          price: item.price ? Number(item.price) : null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Wishlist add error:", error);

    return NextResponse.json(
      { message: "Unable to add recipe." },
      { status: 500 }
    );
  }
}

// CLEAR WISHLIST
export async function DELETE(request: NextRequest) {
  await connection();

  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 }
      );
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        wishlist: {
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      message: "Wishlist cleared successfully.",
    });
  } catch (error) {
    console.error("Wishlist clear error:", error);

    return NextResponse.json(
      { message: "Unable to clear wishlist." },
      { status: 500 }
    );
  }
}