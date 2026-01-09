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
    <div className={clsx("w-full promotion-slider", className)}>
      <Swiper
        modules={[Autoplay, FreeMode]}
        spaceBetween={12}
        slidesPerView="auto"
        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 0.5,
          momentumVelocityRatio: 0.5,
          sticky: false,
          minimumVelocity: 0.02,
        }}
        autoplay={
          safeItems.length > 1
            ? {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: false,
                stopOnLastSlide: false,
              }
            : false
        }
        grabCursor={true}
        touchRatio={1}
        resistance={true}
        resistanceRatio={0.85}
        allowTouchMove={true}
        preventClicks={false}
        preventClicksPropagation={false}
        watchOverflow={true}
      >
        {safeItems.map((props, idx) => (
          <SwiperSlide
            key={`promo-${idx}-${props.name}`}
            style={{
              width: "220px",
            }}
          >
            <PromotionCard {...props} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PromotionSlider;
