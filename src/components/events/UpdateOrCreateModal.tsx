"use client";

import { useCreateEvent, useEvent, useUpdateEvent } from "@/hooks/useEvents";
import { CourseCurrency, currencyOptions } from "@/types/constants";
import { EventFormData, eventValidations } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormFileUpload } from "../common/FileUpload";
import { FormSelect } from "../common/FormDropdown";
import { FormInput } from "../common/FormInput";
import { SimpleEditor } from "../tiptap-templates/simple/simple-editor";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

interface ModalProps {
  eventId?: string | null;
}

const defaultValues: EventFormData = {
  name: "",
  image: { publicId: "", url: "" },
  currency: CourseCurrency.rupee,
  content: "",
  amount: 0,
  joinLink: "",
};

const UpdateOrCreateEvent: React.FC<ModalProps> = ({ eventId }) => {
  const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent();
  const { data, isLoading } = useEvent(eventId);
  const router = useRouter();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventValidations),
    defaultValues: defaultValues,
    mode: "onChange",
  });

  const handleSubmit = async (formData: EventFormData) => {
    try {
      if (eventId) await updateEvent({ id: eventId, data: formData });
      else await createEvent(formData);
      form.reset();
      router.back();
    } catch (error) {
      console.error("इवेंट सहेजने में त्रुटि:", error);
    }
  };

  useEffect(() => {
    console.log(data);
    form.reset(data);
  }, [data]);

  return (
    <div className="p-6 space-y-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col h-full"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {eventId ? "इवेंट संपादित करें" : "नया इवेंट बनाएं"}
              </h1>
            </div>
            <Button
              disabled={
                !form.formState.isDirty ||
                form.formState.isSubmitting ||
                isCreating ||
                isUpdating
              }
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreating
                ? "बनाया जा रहा है..."
                : isUpdating
                ? "अपडेट किया जा रहा है..."
                : eventId
                ? "इवेंट अपडेट करें"
                : "इवेंट बनाएं"}
            </Button>
          </div>

          <div className="space-y-6 pb-6">
            <section className="space-y-4">
              <h3 className="text-lg font-semibold">मूल जानकारी</h3>
              <FormInput
                name="name"
                control={form.control}
                label="इवेंट का नाम *"
                placeholder="इवेंट का नाम दर्ज करें"
              />

              {/* Event Image */}
              <FormFileUpload
                name="image"
                label="इवेंट थंबनेल *"
                accept="image/*"
                control={form.control}
                type="image"
                folder="event"
              />

              {/* Amount & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  name="amount"
                  control={form.control}
                  label="राशि (₹) *"
                  type="number"
                  placeholder="राशि दर्ज करें"
                  min={0}
                />
                <FormSelect
                  label="मुद्रा"
                  name="currency"
                  control={form.control}
                  options={currencyOptions}
                />
              </div>

              {/* Join Link */}
              <FormInput
                name="joinLink"
                control={form.control}
                label="जॉइन लिंक (Zoom/Google Meet)"
                placeholder="Zoom या Google Meet लिंक दर्ज करें"
                type="url"
              />

              <SimpleEditor name="content" />
            </section>
          </div>

          <div className="py-6 border-t mt-auto flex justify-end">
            <Button
              disabled={
                !form.formState.isDirty ||
                form.formState.isSubmitting ||
                isCreating ||
                isUpdating
              }
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isCreating ? (
                "बनाया जा रहा है..."
              ) : isUpdating ? (
                "अपडेट किया जा रहा है..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {eventId ? "अपडेट करें" : "बनाएँ"} इवेंट
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateOrCreateEvent;
