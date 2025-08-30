"use client";

import { useCreateInquiry } from "@/hooks/useInquiry";
import { inquiryFormData, inquirySchema } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormInput } from "../common/FormInput";
import { FormTextarea } from "../common/FormTextArea";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

const defaultValues: inquiryFormData = {
  firstName: "",
  phone: "",
  message: "",
};

const InquiryForm = () => {
  const { mutateAsync: createInquiry, isPending } = useCreateInquiry();
  const form = useForm({
    defaultValues,
    resolver: zodResolver(inquirySchema),
    mode: "onSubmit",
  });

  const handleSubmit = async (data: inquiryFormData) => {
    await createInquiry(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid md:grid-cols-2 gap-6">
          <FormInput
            label="प्रथम नाम *"
            name="firstName"
            control={form.control}
            placeholder="अपना पहला नाम दर्ज करें"
          />
          <FormInput
            label="फोन नंबर *"
            name="phone"
            control={form.control}
            placeholder="10 अंकों का फोन नंबर दर्ज करें"
          />
        </div>

        <FormTextarea
          name="message"
          label="संदेश *"
          control={form.control}
          placeholder="अपना संदेश यहाँ लिखें"
        />

        <Button
          disabled={isPending}
          type="submit"
          size="lg"
          className="w-full gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-smooth group"
        >
          {isPending ? "भेज रहे हैं..." : "संदेश भेजें"}
          <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-smooth" />
        </Button>
      </form>
    </Form>
  );
};

export default InquiryForm;
