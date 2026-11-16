import { CheckCircle, XCircle, X } from "lucide-react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export default function Toast({
  message,
  type = "success",
  onClose,
}: ToastProps) {
  const isSuccess = type === "success";

  return (
    <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-xl bg-white p-4 shadow-lg">
      {isSuccess ? (
        <CheckCircle className="text-green-600" size={22} />
      ) : (
        <XCircle className="text-red-600" size={22} />
      )}

      <p className="text-sm font-medium text-stone-800">
        {message}
      </p>

      <button onClick={onClose} aria-label="Close notification">
        <X size={18} className="text-stone-500" />
      </button>
    </div>
  );
}