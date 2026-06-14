'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  destinationName: string;
}

export default function ImageGallery({ images, destinationName }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="container-full px-4 mb-8">
      {/* Main Image */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
        {images.map((image, index) => (
          <Image
            key={index}
            src={image}
            alt={`${destinationName} - Photo ${index + 1}`}
            fill
            priority={index === 0}
            className={`object-cover transition-opacity duration-500 ${
              index === activeIndex ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="100vw"
          />
        ))}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />

        {/* Nav Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary hover:bg-white transition-colors shadow-md"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-primary hover:bg-white transition-colors shadow-md"
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-primary">
          {activeIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                index === activeIndex
                  ? 'ring-2 ring-secondary scale-105'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={image}
                alt={`${destinationName} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
