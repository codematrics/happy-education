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
  image: {
    publicId: "",
    url: "",
  },
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
      const currentBenefits = benefits || [];
      form.setValue("benefits", [...currentBenefits, benefitInput.trim()]);
      setBenefitInput("");
    }
  };

  const removeBenefit = (index: number) => {
    const currentBenefits = benefits || [];
    form.setValue(
      "benefits",
      currentBenefits.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (formData: EventFormData) => {
    try {
      if (eventId) {
        await updateEvent({ id: eventId, data: formData });
      } else {
        await createEvent(formData);
      }
      onClose();
      form.reset();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  useEffect(() => {
    if (data) {
      form.reset(data);
    } else {
      form.reset(defaultValues);
    }
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
      onClose={onClose}
      onConfirm={form.handleSubmit(handleSubmit)}
      confirmText={
        data
          ? isUpdating
            ? "Updating..."
            : "Update"
          : isCreating
          ? "Adding..."
          : "Add"
      }
      isLoading={isUpdating || isCreating}
      title={data ? "Update Events" : "Add Events"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Event Name */}
          <FormInput
            name="name"
            control={form.control}
            label="Event Name *"
            placeholder="Enter event name"
          />

          {/* Event Image URL */}
          <FormFileUpload
            name="image"
            label="Event Thumbnail *"
            accept="image/*"
            control={form.control}
            type="image"
            folder="event"
          />

          {/* Description */}
          <FormTextarea
            name="description"
            control={form.control}
            label="Description"
            placeholder="Enter event description"
            rows={4}
          />

          {/* Benefits */}
          <FormField
            control={form.control}
            name="benefits"
            render={() => (
              <FormItem>
                <FormLabel>Benefits (Optional)</FormLabel>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter a benefit"
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

          {/* Amount */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              name="amount"
              control={form.control}
              label="Amount (₹) *"
              type="number"
              placeholder="Enter amount"
              min="0"
            />
            <FormSelect
              label="Currency"
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
                <FormLabel>Event Date *</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value.toDateString()}
                    onChange={field.onChange}
                    placeholder="Select event date"
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
            label="Repeating Event"
            helperText="Check if this event repeats regularly"
          />

          {/* Repeat Every (conditional) */}
          {repeating && (
            <FormInput
              name="repeatEvery"
              control={form.control}
              label="Repeat Every (Days) *"
              type="number"
              placeholder="Enter number of days"
              min="1"
            />
          )}

          {/* Join Link */}
          <FormInput
            name="joinLink"
            control={form.control}
            label="Join Link (Zoom/Google Meet) *"
            placeholder="Enter Zoom or Google Meet link"
            type="url"
          />
        </form>
      </Form>
    </Modal>
  );
};

export default UpdateOrCreateModal;
