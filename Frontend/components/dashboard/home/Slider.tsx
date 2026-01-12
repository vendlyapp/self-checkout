"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import {
  Users,
  Flame,
  Receipt,
  Tag,
  Calculator,
  ShoppingCart,
  BarChart3,
  Settings,
  Package,
  TrendingUp,
} from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";

const sliderData = [
  {
    icon: Users,
    text: "Kunden",
    color: "bg-blue-500",
    description: "Kundenverwaltung",
  },
  {
    icon: Flame,
    text: "Bestseller",
    color: "bg-orange-500",
    description: "Top Produkte",
  },
  {
    icon: Receipt,
    text: "Verkäufe",
    color: "bg-green-500",
    description: "Verkaufsübersicht",
  },
  {
    icon: Tag,
    text: "Rabatte",
    color: "bg-purple-500",
    description: "Aktionen & Rabatte",
  },
  {
    icon: Calculator,
    text: "Rechner",
    color: "bg-indigo-500",
    description: "Preisrechner",
  },
  {
    icon: ShoppingCart,
    text: "Warenkorb",
    color: "bg-pink-500",
    description: "Kassenverwaltung",
  },
  {
    icon: BarChart3,
    text: "Analytics",
    color: "bg-cyan-500",
    description: "Datenanalyse",
  },
  {
    icon: Settings,
    text: "Einstellungen",
    color: "bg-gray-500",
    description: "Systemeinstellungen",
  },
  {
    icon: Package,
    text: "Produkte",
    color: "bg-emerald-500",
    description: "Produktverwaltung",
  },
  {
    icon: TrendingUp,
    text: "Berichte",
    color: "bg-rose-500",
    description: "Verkaufsberichte",
  },
];

export default function Slider() {
  return (
    <div className="w-full">
      {/* Mobile/Tablet: Slider horizontal */}
      <div className="block lg:hidden">
        <Swiper
          modules={[Autoplay, FreeMode]}
          spaceBetween={4}
          slidesPerView={4}
          breakpoints={{
            640: {
              slidesPerView: 5,
              spaceBetween: 8,
            },
            768: {
              slidesPerView: 6,
              spaceBetween: 12,
            },
          }}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.25,
            momentumVelocityRatio: 0.5,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          loop={true}
          grabCursor={true}
          touchRatio={1}
          resistance={false}
          touchStartPreventDefault={false}
          touchMoveStopPropagation={false}
          simulateTouch={true}
          allowTouchMove={true}
          nested={true}
          className="w-full"
        >
          {sliderData.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="bg-white rounded-2xl p-3 transition-ios-slow cursor-pointer transform active:scale-95 hover:scale-105 touch-manipulation w-[87px] h-[112px]">
                <div className="flex flex-col items-center space-y-2">
                  <div
                    className={`${item.color} p-2 rounded-xl shadow-sm w-[48px] h-[48px] flex items-center justify-center`}
                  >
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[11px] font-normal text-gray-900 text-center leading-tight">
                    {item.text}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop: Grid de cards modernas */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-3">
          {sliderData.map((item, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-4 transition-ios-slow cursor-pointer hover:shadow-md hover:scale-[1.02] border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-start gap-3">
                {/* Icono */}
                <div
                  className={`${item.color} p-2.5 rounded-lg shadow-sm flex-shrink-0 group-hover:shadow-md transition-shadow duration-300`}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-gray-700 transition-colors duration-200">
                    {item.text}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Indicador de hover */}
              <div className="mt-3 flex items-center justify-between">
                <div className="w-full bg-gray-100 rounded-full h-1">
                  <div
                    className={`${item.color.replace('bg-', 'bg-').replace('-500', '-300')} h-1 rounded-full transition-ios-slow group-hover:w-3/4`}
                    style={{ width: '0%' }}
                  />
                </div>
                <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-1 h-1 bg-gray-400 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
