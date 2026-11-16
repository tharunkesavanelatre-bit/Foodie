import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type CategoryCardProps = {
  name: string;
  description: string;
  image: string;
  count: string;
  index: number;
};

export default function CategoryCard({
  name,
  description,
  image,
  count,
  index,
}: CategoryCardProps) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(name)}`}
      className={`category-app-card category-card-${index + 1}`}
    >
      <img src={image} alt={name} />

      <div className="category-app-overlay">
        <span>{description}</span>
        <h3>{name}</h3>

        <div className="category-explore">
          {count}
          <ArrowUpRight size={17} />
        </div>
      </div>
    </Link>
  );
}