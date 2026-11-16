import { LoaderCircle } from "lucide-react";

type LoaderProps = {
  message?: string;
};

export default function Loader({ message = "Loading..." }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <LoaderCircle
        size={36}
        className="animate-spin text-orange-600"
      />

      <p className="text-sm text-stone-500">{message}</p>
    </div>
  );
}