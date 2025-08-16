import React, { HTMLProps } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

interface Props<T> {
  data: T[];
  render: (item: T) => React.ReactNode;
  className?: HTMLProps<HTMLElement>["className"];
}

const CustomCarousel = <T,>({ data, render, className }: Props<T>) => {
  return (
    <Carousel>
      <CarouselContent>
        {data?.map((item, index) => (
          <CarouselItem key={index} className={className}>
            {render(item)}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default CustomCarousel;
