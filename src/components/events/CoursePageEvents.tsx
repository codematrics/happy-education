"use client";

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types/types";
import { Calendar, ExternalLink } from "lucide-react";
import React, { useState } from "react";
import CustomCarousel from "../common/CustomCarousel";
import CustomImage from "../common/CustomImage";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import PaymentModal from "./PaymentModal";

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const [showPayment, setShowPayment] = useState(false);

  const formatPrice = (price: number, currency: "dollar" | "rupee") => {
    const symbol = currency === "dollar" ? "$" : "₹";
    return `${symbol}${price.toFixed(2)}`;
  };

  return (
    <>
      <Card className="h-full bg-card hover:shadow-lg transition-all duration-300 border border-border/50">
        <CardHeader className="p-0">
          <div className="relative overflow-hidden rounded-t-lg">
            {event.image?.url ? (
              <CustomImage
                src={event.image.url}
                alt={event.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            <div className="absolute top-3 right-3">
              <Badge className="bg-background text-foreground shadow-md">
                {formatPrice(event.amount, event.currency)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-2">
              {event.name}
            </h3>
            {event.content && (
              <div
                dangerouslySetInnerHTML={{ __html: event.content }}
                className="text-sm text-muted-foreground line-clamp-2"
              ></div>
            )}
          </div>

          <Button
            onClick={() => setShowPayment(true)}
            className="w-full mt-4"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            इवेंट में शामिल हों
          </Button>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        event={event}
      />
    </>
  );
};

const CoursePageEvents: React.FC = () => {
  const { data: eventsData, isLoading } = useEvents();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">आगामी इवेंट्स</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const events = eventsData?.data || [];

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="py-7">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-2">
        <h2 className="text-3xl font-bold">हमारे इवेंट्स न चूकें</h2>
        <p className="text-muted-foreground">
          विशेषज्ञों से जुड़ें और अपने ज्ञान का विस्तार करें
        </p>
      </div>

      {events.length <= 3 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="mb-12 relative px-5">
          <CustomCarousel
            data={events}
            render={(event: Event) => <EventCard event={event} />}
            className="basis-1/1 md:basis-1/2 lg:basis-1/3"
          />
        </div>
      )}
    </div>
  );
};

export default CoursePageEvents;
