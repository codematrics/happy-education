import PlaceHolderImage from "@/../public/placeholders/image.png";
import Image from "next/image";
import React, { HTMLProps } from "react";

interface Props {
  src: File | string;
  alt: string;
  className?: HTMLProps<HTMLElement>["className"];
}

const CustomImage: React.FC<Props> = ({ src, alt, className }) => {
  if (!src)
    return <Image src={PlaceHolderImage} alt={alt} className={className} />;
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
