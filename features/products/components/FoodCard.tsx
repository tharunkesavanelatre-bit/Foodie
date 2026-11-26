import Link from "next/link";
import { ArrowUpRight, Star, Plus } from "lucide-react";

import { formatCurrency } from "@/lib/formatCurrency";

type FoodCardProps = {
  name: string;
  price: string;
  rating: string;
  image: string;
  tag: string;
};

export default function FoodCard({
  name,
  price,
  rating,
  image,
  tag,
}: FoodCardProps) {
  const foodLink = `/products/${name.toLowerCase().replace(/\s+/g, "-")}`;

  const numericPrice = Number(price.replace(/[^\d.]/g, ""));

  const formattedPrice = formatCurrency(
    Number.isFinite(numericPrice) ? numericPrice : 0
  );

  return (
    <article className="popular-app-card products-premium-card">
      {/* FOOD IMAGE */}
      <Link href={foodLink} className="popular-food-image">
        <img
          src={image}
          alt={name}
          loading="lazy"
        />

        <span className="popular-food-tag">{tag}</span>

        <span className="products-card-arrow">
          <ArrowUpRight size={19} />
        </span>
      </Link>

      {/* FOOD DETAILS */}
      <div className="popular-food-details">
        <div className="popular-food-title">
          <h3>{name}</h3>

          <span className="popular-rating">
            <Star size={14} fill="currentColor" />
            {rating}
          </span>
        </div>

        {/* PRICE AND ACTION */}
        <div className="products-card-bottom">
          <div className="products-card-price">
            <span>PRICE</span>
            <strong>{formattedPrice}</strong>
          </div>

          <Link
            href={foodLink}
            className="products-card-action"
            aria-label={`Explore ${name}`}
          >
            <Plus size={21} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}