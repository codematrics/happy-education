import { useCreateEvent, useUpdateEvent } from "@/hooks/useEvents";
import { CourseCurrency, currencyOptions } from "@/types/constants";
import { EventFormData, eventValidations } from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Modal from "../common/CustomDialog";
import { FormFileUpload } from "../common/FileUpload";
import { FormCheckbox } from "../common/FormCheckBox";
import { FormSelect } from "../common/FormDropdown";
import { FormInput } from "../common/FormInput";
import { FormTextarea } from "../common/FormTextArea";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { DatePicker } from "../ui/date-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: EventFormData | null;
  eventId?: string | null;
}

const defaultValues: EventFormData = {
  name: "",
  image: { publicId: "", url: "" },
  currency: CourseCurrency.rupee,
  description: "",
  benefits: [],
  amount: 0,
  day: new Date(),
  repeating: false,
  repeatEvery: 1,
  joinLink: "",
};

const UpdateOrCreateModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  data,
  eventId,
}) => {
  const [benefitInput, setBenefitInput] = useState("");
  const { mutateAsync: createEvent, isPending: isCreating } = useCreateEvent();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventValidations),
    defaultValues,
    mode: "onChange",
  });

  const benefits = form.watch("benefits");
  const repeating = form.watch("repeating");

  const addBenefit = () => {
    if (benefitInput.trim()) {
      form.setValue("benefits", [...(benefits || []), benefitInput.trim()]);
      setBenefitInput("");
    }
  };

  const removeBenefit = (index: number) => {
    form.setValue(
      "benefits",
      (benefits || []).filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (formData: EventFormData) => {
    try {
      if (eventId) await updateEvent({ id: eventId, data: formData });
      else await createEvent(formData);
      onClose();
      form.reset();
    } catch (error) {
      console.error("इवेंट सहेजने में त्रुटि:", error);
    }
  };

  useEffect(() => {
    form.reset(data || defaultValues);
    setBenefitInput("");
  }, [data, form]);

  const handleClose = () => {
    form.reset();
    setBenefitInput("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={form.handleSubmit(handleSubmit)}
      confirmText={
        data
          ? isUpdating
            ? "अपडेट कर रहे हैं..."
            : "अपडेट करें"
          : isCreating
          ? "जोड़ रहे हैं..."
          : "जोड़ें"
      }
      isLoading={isUpdating || isCreating}
      title={data ? "इवेंट अपडेट करें" : "इवेंट जोड़ें"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Event Name */}
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

          {/* Description */}
          <FormTextarea
            name="description"
            control={form.control}
            label="विवरण"
            placeholder="इवेंट का विवरण दर्ज करें"
            rows={4}
          />

          {/* Benefits */}
          <FormField
            control={form.control}
            name="benefits"
            render={() => (
              <FormItem>
                <FormLabel>लाभ (वैकल्पिक)</FormLabel>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="लाभ दर्ज करें"
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addBenefit();
                        }
                      }}
                    />
                    <Button type="button" onClick={addBenefit} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {benefits && benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {benefits.map((benefit, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-sm"
                        >
                          {benefit}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-2"
                            onClick={() => removeBenefit(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
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

          {/* Date */}
          <FormField
            control={form.control}
            name="day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>इवेंट की तिथि *</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value.toDateString()}
                    onChange={field.onChange}
                    placeholder="तिथि चुनें"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Repeating */}
          <FormCheckbox
            name="repeating"
            control={form.control}
            label="दोहराने वाला इवेंट"
            helperText="यदि यह इवेंट नियमित रूप से दोहराता है तो चेक करें"
          />

          {/* Repeat Every (conditional) */}
          {repeating && (
            <FormInput
              name="repeatEvery"
              control={form.control}
              label="हर कितने दिन में दोहराएं *"
              type="number"
              placeholder="दिनों की संख्या दर्ज करें"
              min={1}
            />
          )}

          {/* Join Link */}
          <FormInput
            name="joinLink"
            control={form.control}
            label="जॉइन लिंक (Zoom/Google Meet) *"
            placeholder="Zoom या Google Meet लिंक दर्ज करें"
            type="url"
          />
        </form>
      </Form>
    </Modal>
  );
};

export default UpdateOrCreateModal;
