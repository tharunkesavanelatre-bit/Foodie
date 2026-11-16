import { Search, ArrowRight } from "lucide-react";

export default function SearchBar() {
  return (
    <form
      role="search"
      action="/explore"
      method="GET"
      className="hero-search"
    >
      <Search size={21} aria-hidden="true" />

      <input
        type="search"
        name="q"
        placeholder="What are you craving today?"
        aria-label="Search for food"
      />

      <button type="submit" aria-label="Search food">
        <ArrowRight size={21} />
      </button>
    </form>
  );
}