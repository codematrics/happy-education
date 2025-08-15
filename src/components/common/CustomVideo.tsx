import { HTMLProps } from "react";

interface Props {
  src: string | File;
  className: HTMLProps<HTMLElement>["className"];
}

const CustomVideo: React.FC<Props> = ({ src, className }) => {
  return (
    <video className={className} controls>
      <source src={typeof src === "string" ? src : URL.createObjectURL(src)} />
    </video>
  );
};

export default CustomVideo;
