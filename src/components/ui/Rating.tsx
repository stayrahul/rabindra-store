"use client";

import React from "react";
import { Star } from "lucide-react";

export interface CustomRatingProps {
  initialValue?: number;
  size?: number;
  readonly?: boolean;
  allowFraction?: boolean;
  fillColor?: string;
}

const Rating = ({ initialValue = 0, size = 20, fillColor = "#f59e0b" }: CustomRatingProps) => {
  const fullStars = Math.floor(initialValue);
  const hasHalfStar = initialValue % 1 !== 0;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} size={size} fill={fillColor} color={fillColor} />;
        }
        if (i === fullStars && hasHalfStar) {
          return (
            <div key={i} className="relative">
              <Star size={size} color={fillColor} className="opacity-30" />
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star size={size} fill={fillColor} color={fillColor} />
              </div>
            </div>
          );
        }
        return <Star key={i} size={size} color={fillColor} className="opacity-30" />;
      })}
    </div>
  );
};

export default Rating;
