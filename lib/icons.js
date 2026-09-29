import {
  Briefcase, CircleEllipsis, Car, Clapperboard, Dumbbell, GraduationCap, HeartPulse,
  Home, Laptop, Receipt, ShoppingBag, Tag, Utensils,
} from "lucide-react";

const map = {
  briefcase: Briefcase,
  "circle-ellipsis": CircleEllipsis,
  car: Car,
  clapperboard: Clapperboard,
  dumbbell: Dumbbell,
  "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse,
  home: Home,
  laptop: Laptop,
  receipt: Receipt,
  "shopping-bag": ShoppingBag,
  tag: Tag,
  utensils: Utensils,
};

export const iconFor = (name) => map[name] ?? Tag;
export const iconNames = Object.keys(map);
