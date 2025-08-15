import React, { HTMLProps } from "react";
import ErrorCard from "./ErrorCard";

interface Props {
  isLoading: boolean;
  skeleton: React.ReactNode;
  skeletonClassName?: HTMLProps<HTMLElement>["className"];
  errorTitle: string;
  error?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

const LoadingError = ({
  skeleton,
  isLoading,
  error,
  children,
  errorTitle,
  onRetry,
  skeletonClassName,
}: Props) => {
  if (isLoading)
    return <div className={skeletonClassName || ""}>{skeleton}</div>;

  if (error) {
    return <ErrorCard title={errorTitle} message={error} onRetry={onRetry} />;
  }

  return children;
};

export default LoadingError;
