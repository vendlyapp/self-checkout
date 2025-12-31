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

  // Solo activar loop si hay más de 2 items
  const shouldLoop = safeItems.length > 2;

  return (
    <div className={clsx("w-full", className)}>
      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={8}
        slidesPerView={1.6}
        centeredSlides={true}
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.25,
          momentumVelocityRatio: 0.5,
          sticky: false,
        }}
        autoplay={
          safeItems.length > 1
            ? {
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                stopOnLastSlide: false,
              }
            : false
        }
        breakpoints={{
          320: {
            slidesPerView: 1.6,
          },
          380: {
            slidesPerView: 1.6,
          },
          480: {
            slidesPerView: 1.7,
          },
          640: {
            slidesPerView: 1.7,
          },
        }}
        loop={shouldLoop}
        grabCursor={true}
        touchRatio={1}
        resistance={true}
        resistanceRatio={0.85}
        allowTouchMove={true}
        preventClicks={false}
        preventClicksPropagation={false}
        watchOverflow={true}
        className="w-full"
      >
        {safeItems.map((props, idx) => (
          <SwiperSlide key={`promo-${idx}-${props.name}`}>
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
