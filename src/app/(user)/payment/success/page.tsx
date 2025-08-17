"use client";

import PaymentSuccess from "@/components/payment/PaymentSuccess";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  
  const transactionId = searchParams.get("transactionId");
  const courseId = searchParams.get("courseId");
  const courseName = searchParams.get("courseName");
  const isNewUser = searchParams.get("newUser") === "true";
  const userEmail = searchParams.get("email");

  return (
    <PaymentSuccess
      transactionId={transactionId || undefined}
      courseId={courseId || undefined}
      courseName={courseName || undefined}
      isNewUser={isNewUser}
      userEmail={userEmail || undefined}
    />
  );
};

const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;