'use client';

import React from 'react';
import {
  Leaf,
  Sunrise,
  Sun,
  Moon,
  Heart,
  Eye,
  Compass,
  Mountain,
  Waves,
  Wind,
  TreePine,
  Flower2,
  Cloud,
  CloudFog,
  Sprout,
  Coffee,
  Droplets,
  Wifi,
  Coins,
  HeartPulse,
  VolumeX,
  Plane,
  Home,
  Sunset,
  Landmark,
  ShoppingBag,
  Utensils,
  HandHeart,
  TreePalm,
  Laptop,
  Car,
  ChefHat,
  BookOpen,
  Palette,
  Building,
  Footprints,
  PartyPopper,
  MapPin,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'leaf': Leaf,
  'sunrise': Sunrise,
  'sun': Sun,
  'moon': Moon,
  'heart': Heart,
  'eye': Eye,
  'compass': Compass,
  'mountain': Mountain,
  'waves': Waves,
  'wind': Wind,
  'tree-pine': TreePine,
  'flower-2': Flower2,
  'cloud': Cloud,
  'cloud-fog': CloudFog,
  'sprout': Sprout,
  'coffee': Coffee,
  'droplets': Droplets,
  'wifi': Wifi,
  'coins': Coins,
  'heart-pulse': HeartPulse,
  'volume-x': VolumeX,
  'plane': Plane,
  'home': Home,
  'sunset': Sunset,
  'landmark': Landmark,
  'shopping-bag': ShoppingBag,
  'utensils': Utensils,
  'hand-heart': HandHeart,
  'palmtree': TreePalm,
  'laptop': Laptop,
  'car': Car,
  'chef-hat': ChefHat,
  'book-open': BookOpen,
  'palette': Palette,
  'building': Building,
  'footprints': Footprints,
  'party-popper': PartyPopper,
  'map-pin': MapPin,
};

interface LucideIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function LucideIcon({ name, className, style }: LucideIconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    return <Leaf className={className} style={style} />;
  }
  return <IconComponent className={className} style={style} />;
}
