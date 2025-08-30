"use client";

import { useModal } from "@/context/CheckOutContext";
import CheckoutModal from "../payment/CheckoutModal";
import PaymentForm from "../payment/PaymentForm";
import { Button } from "../ui/button";

export default function ModalRoot() {
  const { modal, closeModal } = useModal();

  if (!modal.type) return null;

  if (modal.type === "checkout") {
    return <CheckoutModal isOpen {...modal.props} />;
  }

  if (modal.type === "payment") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Complete Payment</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeModal}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
          <PaymentForm {...modal.props} />
        </div>
      </div>
    );
  }

  return null;
}
