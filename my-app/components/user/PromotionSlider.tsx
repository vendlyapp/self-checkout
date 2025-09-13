"use client";

import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import PromotionCard, {
  PromotionCardProps,
} from "@/components/user/PromotionCard";
import { clsx } from "clsx";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";

export type PromotionSliderProps = {
  items: PromotionCardProps[];
  className?: string;
};

const PromotionSlider: React.FC<PromotionSliderProps> = ({
  items,
  className,
}) => {
  const safeItems = useMemo(() => items ?? [], [items]);

  return (
    <div className={clsx("w-full", className)}>
      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={8}
        slidesPerView={1.7}
        maxBackfaceHiddenSlides={10}
        centeredSlides={true}
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.25,
          momentumVelocityRatio: 0.5,
        }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1.4,
          },
          380: {
            slidesPerView: 1.6,
          },
          480: {
            slidesPerView: 1.7,
          },
          640: {
            slidesPerView: 2,
          },
        }}
        loop={true}
        grabCursor={true}
        touchRatio={1}
        resistance={false}
        allowTouchMove={true}
        preventClicks={false}
        preventClicksPropagation={false}
        className="w-full"
      >
        {safeItems.map((props, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex justify-center">
              <PromotionCard {...props} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PromotionSlider;
