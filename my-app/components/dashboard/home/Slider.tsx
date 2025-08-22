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
        spaceBetween={8}
        slidesPerView={4.6}
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.25,
          momentumVelocityRatio: 0.5,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        loop={true}
        grabCursor={true}
        touchRatio={1}
        resistance={false}
        breakpoints={{
          375: {
            slidesPerView: 2.5,
            spaceBetween: 14,
          },
          425: {
            slidesPerView: 2.8,
            spaceBetween: 16,
          },
          480: {
            slidesPerView: 3.2,
            spaceBetween: 18,
          },
          640: {
            slidesPerView: 3.8,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 4.5,
            spaceBetween: 22,
          },
          1024: {
            slidesPerView: 5.5,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 26,
          },
        }}
        className="w-full"
      >
        {sliderData.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="bg-white rounded-2xl p-4 transition-all duration-300 cursor-pointer transform active:scale-95 touch-manipulation">
              <div className="flex flex-col items-center space-y-2.5">
                <div className={`${item.color} p-2.5 rounded-xl shadow-sm`}>
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
