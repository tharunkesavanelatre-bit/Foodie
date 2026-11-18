import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Get cart items
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

    const items = await prisma.cartItem.findMany({
      where: {
        cart: { userId: user.id },
      },
      select: {
        id: true,
        idMeal: true,
        name: true,
        price: true,
        image: true,
        category: true,
        quantity: true,
      },
    });

    const formattedItems = items.map((item) => ({
      ...item,
      price: item.price.toString(),
      image: item.image || "",
    }));

    return NextResponse.json(
      { items: formattedItems },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Cart fetch error:", error);

    return NextResponse.json(
      { message: "Unable to fetch cart." },
      { status: 500 }
    );
  }
}

// Add item to cart
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

    const name = String(body.name || "").trim();
    const price = Number(
      String(body.price || "").replace(/[^\d.]/g, "")
    );
    const image = String(body.image || "");
    const idMeal = body.idMeal ? String(body.idMeal) : null;
    const category = body.category ? String(body.category) : null;

    if (!name || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json(
        { message: "Invalid food details." },
        { status: 400 }
      );
    }

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        ...(idMeal ? { idMeal } : { name }),
      },
    });

    const savedItem = existingItem
      ? await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: { increment: 1 },
            price,
            image,
            category,
          },
        })
      : await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            idMeal,
            name,
            price,
            image,
            category,
            quantity: 1,
          },
        });

    return NextResponse.json(
      {
        message: "Item added to cart.",
        item: {
          id: savedItem.id,
          idMeal: savedItem.idMeal,
          name: savedItem.name,
          price: savedItem.price.toString(),
          image: savedItem.image || "",
          category: savedItem.category,
          quantity: savedItem.quantity,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Cart add error:", error);

    return NextResponse.json(
      { message: "Unable to add item to cart." },
      { status: 500 }
    );
  }
}