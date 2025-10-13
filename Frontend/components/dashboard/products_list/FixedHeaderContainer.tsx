"use client";

import React from "react";

interface FixedHeaderContainerProps {
  children: React.ReactNode;
}

export default function FixedHeaderContainer({
  children,
}: FixedHeaderContainerProps) {
  return (
    <div className="flex-1 overflow-hidden pt-[230px]">
      {children}
    </div>
  );
}
