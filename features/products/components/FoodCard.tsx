import Link from "next/link";
import { ArrowUpRight, Star, Plus } from "lucide-react";

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

  return (
    <article className="popular-app-card">
      <Link href={foodLink} className="popular-food-image">
        <img src={image} alt={name} />

        <span className="popular-food-tag">{tag}</span>

        <span className="popular-food-arrow">
          <ArrowUpRight size={19} />
        </span>
      </Link>

      <div className="popular-food-details">
        <div className="popular-food-title">
          <h3>{name}</h3>

          <span className="popular-rating">
            <Star size={14} fill="currentColor" />
            {rating}
          </span>
        </div>

        <div className="popular-food-bottom">
          <strong>{price}</strong>

          <Link href={foodLink} aria-label={`Explore ${name}`}>
            <Plus size={20} />
          </Link>
        </div>
      </div>
    </article>
  );
}