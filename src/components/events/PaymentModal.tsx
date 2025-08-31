"use client";

import { FormInput } from "@/components/common/FormInput";
import { Form } from "@/components/ui/form";
import { Event } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import Modal from "../common/CustomDialog";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const paymentSchema = z.object({
  email: z.string().email("वैध ईमेल आवश्यक है").optional(),
  phone: z.string().regex(/^[0-9]{10}$/, "10-अंकों का वैध फ़ोन नंबर आवश्यक है"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [processingMessage, setProcessingMessage] = React.useState("");
  const [showResult, setShowResult] = React.useState(false);
  const [resultData, setResultData] = React.useState<{
    success: boolean;
    title: string;
    message: string;
  } | null>(null);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  });

  const formatPrice = (price: number, currency: "dollar" | "rupee") => {
    const symbol = currency === "dollar" ? "$" : "₹";
    return `${symbol}${price.toFixed(2)}`;
  };

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const existingScript = document.querySelector(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );
        if (existingScript) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    if (isOpen && !window.Razorpay) {
      loadRazorpayScript().then((loaded) => {
        if (!loaded) {
          toast.error(
            "भुगतान गेटवे लोड करने में विफल। कृपया पेज को रिफ्रेश करें और पुनः प्रयास करें।"
          );
        }
      });
    }
  }, [isOpen]);

  const handlePayment = async (formData: PaymentFormData) => {
    try {
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        toast.error("भुगतान कॉन्फ़िगरेशन त्रुटि। समर्थन से संपर्क करें।");
        return;
      }
      if (!window.Razorpay) {
        toast.error("भुगतान गेटवे लोड नहीं हुआ। कृपया पुनः प्रयास करें।");
        return;
      }

      const orderResponse = await fetch("/api/v1/events/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event._id,
          amount: event.amount,
          currency: event.currency,
          userDetails: formData,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.message || "भुगतान ऑर्डर बनाने में विफल");
      }

      const orderData = await orderResponse.json();

      const options = {
        key: razorpayKey,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "इवेंट पंजीकरण",
        description: `${event.name} के लिए पंजीकरण`,
        order_id: orderData.data.id,
        prefill: {
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#3B82F6" },
        handler: async (response: any) => {
          setIsProcessing(true);
          setProcessingMessage("आपके भुगतान की जांच की जा रही है...");

          try {
            const verifyResponse = await fetch(
              "/api/v1/events/payment/verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  eventId: event._id,
                  userDetails: formData,
                }),
              }
            );

            if (!verifyResponse.ok) throw new Error("भुगतान सत्यापन विफल");

            const result = await verifyResponse.json();
            setIsProcessing(false);

            if (result.status) {
              setResultData({
                success: true,
                title: "भुगतान सफल! 🎉",
                message:
                  "आपका पंजीकरण पुष्टि हो गया है! इवेंट विवरण आपके ईमेल पर भेज दिए गए हैं। कृपया अपने इनबॉक्स (और स्पैम फ़ोल्डर) की जाँच करें।",
              });
              setShowResult(true);
            } else {
              throw new Error(result.message || "भुगतान सत्यापन विफल");
            }
          } catch (error: any) {
            setIsProcessing(false);
            setResultData({
              success: false,
              title: "भुगतान विफल ❌",
              message:
                error.message ||
                "भुगतान सत्यापन विफल। कृपया पुनः प्रयास करें या समर्थन से संपर्क करें।",
            });
            setShowResult(true);
          }
        },
        modal: {
          ondismiss: () => {
            if (!isProcessing) {
              setResultData({
                success: false,
                title: "भुगतान रद्द किया गया",
                message:
                  "आपने भुगतान प्रक्रिया को रद्द कर दिया है। आप कभी भी पुनः प्रयास कर सकते हैं।",
              });
              setShowResult(true);
            }
          },
        },
      };

      try {
        new window.Razorpay(options).open();
      } catch (error: any) {
        toast.error("भुगतान गेटवे आरंभ करने में विफल। कृपया पुनः प्रयास करें।");
      }
    } catch (error: any) {
      toast.error(error.message || "भुगतान प्रारंभ करने में विफल");
    }
  };

  const handleClose = () => {
    setIsProcessing(false);
    setProcessingMessage("");
    setShowResult(false);
    setResultData(null);
    form.reset();
    onClose();
  };

  const handleResultClose = () => {
    setShowResult(false);
    setResultData(null);
    if (resultData?.success) handleClose();
  };

  if (isProcessing) {
    return (
      <Modal isOpen={true} onClose={() => {}}>
        <div className="p-8 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">
            भुगतान संसाधित किया जा रहा है
          </h3>
          <p className="text-muted-foreground">{processingMessage}</p>
        </div>
      </Modal>
    );
  }

  if (showResult && resultData) {
    return (
      <Modal
        isOpen={true}
        confirmText={resultData.success ? "ठीक है!" : "पुनः प्रयास करें"}
        onConfirm={handleResultClose}
        onClose={handleResultClose}
      >
        <div className="p-6 text-center">
          <div
            className={`text-6xl mb-4 ${
              resultData.success ? "text-green-500" : "text-red-500"
            }`}
          >
            {resultData.success ? "🎉" : "❌"}
          </div>
          <h3 className="text-xl font-semibold mb-3">{resultData.title}</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {resultData.message}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen && !isProcessing && !showResult}
      onClose={handleClose}
      title="इवेंट पंजीकरण"
      confirmText={`भुगतान ${formatPrice(event.amount, event.currency)}`}
      onConfirm={form.handleSubmit((data) => {
        handleClose(); // ✅ hide modal immediately
        handlePayment(data); // then start payment flow
      })}
    >
      <div className="p-6">
        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-lg mb-2">{event.name}</h3>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>पंजीकरण शुल्क:</span>
            <span className="font-medium text-foreground text-lg">
              {formatPrice(event.amount, event.currency)}
            </span>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handlePayment)}
            className="space-y-4"
          >
            <FormInput
              name="email"
              control={form.control}
              label="ईमेल *"
              type="email"
              placeholder="अपना ईमेल दर्ज करें"
            />
            <FormInput
              name="phone"
              control={form.control}
              label="फ़ोन नंबर *"
              type="tel"
              placeholder="10-अंकों का फ़ोन नंबर दर्ज करें"
            />
          </form>
        </Form>
      </div>
    </Modal>
  );
};

export default PaymentModal;
