import { ArrowLeftIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeaderNav() {
  const router = useRouter();
  return (
    <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2 justify-between w-full px-4">
        <button className="flex items-center gap-2 cursor-pointer" onClick={() => router.back()}>   
          <ArrowLeftIcon className="w-6 h-6" />
          <span className="text-[18px] font-semibold ">Verkauf starten</span> 
        </button>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <XIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}