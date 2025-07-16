import HeaderNav from "@/components/navigation/HeaderNav";
import { SearchInput } from "@/components/ui/search-input";
import { QrCodeIcon } from "lucide-react";
import SliderFilter from "@/components/Sliders/SliderFIlter";

export default function DashBoardCharge() {
  return (
    <div>
      <HeaderNav />
      <div className="p-4 flex flex-col-2 gap-4 items-center justify-center">
        <SearchInput placeholder="Produkte suchen..." className="w-[260.5px] h-[54px]" />
        <button className="bg-brand-500 cursor-pointer text-white px-4 py-3 flex items-center text-[18px] font-semibold gap-2 rounded-[30px] w-[124px] h-[54px]">
          <QrCodeIcon className="w-6 h-6" />
          <span className="text-[16px]">Scan</span>
        </button>
      </div>
      <SliderFilter />
    </div>
  );
} 