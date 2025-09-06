"use client";

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-templates/simple/simple-editor.scss";

import { useEvent } from "@/hooks/useEvents";
import { useTestimonials } from "@/hooks/useTestimonial";
import { CourseCurrency } from "@/types/constants";
import { DollarSign, IndianRupee } from "lucide-react";
import { useState } from "react";
import CustomImage from "../common/CustomImage";
import LoadingError from "../common/LoadingError";
import TestimonialCard from "../testimonal/TestimonialCard";
import { Button } from "../ui/button";
import { EventPageSkeleton } from "./EventSkeleton";
import PaymentModal from "./PaymentModal";

const EventPage = ({ eventId }: { eventId: string }) => {
  const [showModal, setShowModal] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null); // <-- currently playing video
  const { data, isLoading, error } = useEvent(eventId);
  const { data: testimonials } = useTestimonials({ page: 1, limit: 10 });

  return (
    <LoadingError
      skeleton={<EventPageSkeleton />}
      error={error?.message}
      errorTitle="Error While Fetching Event"
      isLoading={isLoading}
    >
      <div className="bg-[#0eff094a]">
        <div className="max-w-5xl mx-auto p-4">
          <div>
            <CustomImage
              src={data?.image?.url || ""}
              alt={data?.name || ""}
              className="w-full object-cover"
            />
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight my-3">
              {data?.name}
            </h1>
          </div>

          <div
            className="tiptap ProseMirror simple-editor simple-editor-content !w-full !max-w-full !m-0"
            dangerouslySetInnerHTML={{ __html: data?.content || "" }}
          ></div>

          <div className="fixed bottom-0 left-0 w-full bg-card shadow-strong border-t border-border z-50">
            <div className="container mx-auto px-4 py-3 flex justify-end items-center">
              <Button
                size="lg"
                className="w-full md:w-auto bg-[#e8331e]"
                onClick={() => setShowModal(true)}
              >
                <span className="flex items-center text-lg font-medium">
                  {data?.currency === CourseCurrency.dollar ? (
                    <DollarSign className="m-0" />
                  ) : (
                    <IndianRupee className="m-0" />
                  )}
                  {data?.amount} पेमेंट करके अभी वर्कशॉप जॉइन करें
                </span>
              </Button>
            </div>
          </div>

          {/* Testimonials */}
          {testimonials?.data.items && testimonials?.data.items.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
              {testimonials.data.items.map((testimonial) => (
                <TestimonialCard
                  key={testimonial._id}
                  testimonial={testimonial}
                  isPlaying={currentPlayingId === testimonial._id} // <-- only current plays
                  onPlay={() => setCurrentPlayingId(testimonial._id)} // notify playing
                  onPause={() => setCurrentPlayingId(null)} // notify pause
                />
              ))}
            </div>
          )}
        </div>

        {data && (
          <PaymentModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            event={data}
          />
        )}
      </div>
    </LoadingError>
  );
};

export default EventPage;
