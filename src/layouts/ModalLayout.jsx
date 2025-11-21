import { CircleX } from "lucide-react";

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-8 py-8 overflow-y-auto custom-scrollbar">
      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-5xl max-h-[calc(100vh-4rem)] overflow-y-auto p-6 flex">
        <button onClick={onClose} className="absolute top-2 right-2 text-4xl text-gray-500 hover:text-gray-700 transition"><CircleX size={28}/></button>
        {children}
      </div>
    </div>
  );
}
