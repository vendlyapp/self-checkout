"use client";

import React, { useMemo, useRef } from "react";
import PromotionCard, { PromotionCardProps } from "@/components/user/PromotionCard";
import { clsx } from "clsx";

export type PromotionSliderProps = {
  items: PromotionCardProps[];
  className?: string;
};

const PromotionSlider: React.FC<PromotionSliderProps> = ({ items, className }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const safeItems = useMemo(() => items ?? [], [items]);

  return (
    <div className={clsx("w-screen", className)}>
      <div
        ref={listRef}
        className="w-screen h-[330px] overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
      >
        <div className="flex px-4 ">
          {safeItems.map((props, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-[90vw] max-w-[250px] snap-center"
            >
              <PromotionCard {...props} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionSlider;
