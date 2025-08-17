"use client";

import PlaceHolderImage from "@/../public/placeholders/image.png";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { HTMLProps, useState } from "react";

interface Props {
  src: File | string;
  alt: string;
  className?: HTMLProps<HTMLElement>["className"];
}

const CustomImage: React.FC<Props> = ({ src, alt, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const imageSrc =
    !src || hasError
      ? PlaceHolderImage
      : typeof src === "string"
      ? src
      : URL.createObjectURL(src);

  return (
    <div
      className={cn(
        "relative w-full h-full overflow-hidden rounded-2xl",
        className
      )}
    >
      {/* Skeleton shimmer while loading */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
      )}

      <motion.div
        initial={{ opacity: 0.5, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full h-full"
      >
        <Image
          src={imageSrc}
          alt={alt}
          width={500}
          height={500}
          className={cn("object-cover rounded-2xl w-full h-full", className)}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </motion.div>
    </div>
  );
};

export default CustomImage;
