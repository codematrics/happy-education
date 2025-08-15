import Image from "next/image";
import React, { HTMLProps } from "react";

interface Props {
  src: File | string;
  alt: string;
  className?: HTMLProps<HTMLElement>["className"];
}

const CustomImage: React.FC<Props> = ({ src, alt, className }) => {
  return (
    <Image
      src={typeof src === "string" ? src : URL.createObjectURL(src)}
      alt={alt}
      className={className}
      width={500}
      height={500}
    />
  );
};

export default CustomImage;
