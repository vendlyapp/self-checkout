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
} from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";

const sliderData = [
  {
    icon: Users,
    text: "Kunden",
    color: "bg-green-500",
  },
  {
    icon: Flame,
    text: "Bestseller",
    color: "bg-green-500",
  },
  {
    icon: Receipt,
    text: "Verkäufe",
    color: "bg-green-500",
  },
  {
    icon: Tag,
    text: "Rabatte",
    color: "bg-green-500",
  },
  {
    icon: Calculator,
    text: "Rechner",
    color: "bg-green-500",
  },
  {
    icon: ShoppingCart,
    text: "Warenkorb",
    color: "bg-green-500",
  },
];

export default function Slider() {
  return (
    <div className="w-full mb-8">
      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={4}
        slidesPerView={4}
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
        className="w-full"
      >
        {sliderData.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white rounded-2xl p-4 transition-all duration-300 cursor-pointer transform active:scale-95 touch-manipulation w-[87px] h-[112px]">
              <div className="flex flex-col items-center space-y-2.5">
                <div
                  className={`${item.color} p-2.5 rounded-xl shadow-sm w-[52px] h-[52px] flex items-center justify-center`}
                >
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[12px] font-normal text-gray-900 text-center leading-tight">
                  {item.text}
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
