export function formatPrice(price: number): string {
  return `\u20B9${price.toFixed(2)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}