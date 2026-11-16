type SectionHeadingProps = {
  badge: string;
  title: string;
  highlight?: string;
  description?: string;
  headingClassName?: string;
  badgeClassName?: string;
};

export default function SectionHeading({
  badge,
  title,
  highlight,
  description,
  headingClassName = "category-heading",
  badgeClassName = "category-badge",
}: SectionHeadingProps) {
  return (
    <div className={headingClassName}>
      <div>
        <span className={badgeClassName}>{badge}</span>

        <h2>
          {title} <span>{highlight}</span>
        </h2>

        {description && <p>{description}</p>}
      </div>
    </div>
  );
}