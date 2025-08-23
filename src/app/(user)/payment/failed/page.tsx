"use client";

import PaymentFailed from "@/components/payment/PaymentFailed";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PaymentFailedContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId");
  const courseName = searchParams.get("courseName");
  const error = searchParams.get("error");
  const orderId = searchParams.get("orderId");

  const handleRetry = () => {
    if (courseId) {
      router.replace(`/course/${courseId}`);
    } else {
      router.replace(`/courses`);
    }
  };

  return (
    <PaymentFailed
      courseId={courseId || undefined}
      courseName={courseName || undefined}
      error={error || undefined}
      orderId={orderId || undefined}
      onRetry={handleRetry}
    />
  );
};

const PaymentFailedPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
};

export default PaymentFailedPage;
