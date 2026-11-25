import { NextResponse } from "next/server";
import { foods } from "@/data/foods";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: foods,
  });
}
