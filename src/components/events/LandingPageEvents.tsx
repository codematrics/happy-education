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
import CustomImage from "../common/CustomImage";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import PaymentModal from "./PaymentModal";

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  const [showPayment, setShowPayment] = useState(false);

  const formatPrice = (price: number, currency: "dollar" | "rupee") => {
    const symbol = currency === "dollar" ? "$" : "₹";
    return `${symbol}${price.toFixed(2)}`;
  };

  return (
    <>
      <Card className="w-full min-h-[600px] bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-none shadow-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-2 min-h-[300px]">
            {/* Event Image */}
            <div className="relative overflow-hidden">
              {event.image?.url ? (
                <CustomImage
                  src={event.image.url}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <Calendar className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
              {/* Price Badge */}
              <div className="absolute top-6 left-6">
                <Badge className="text-lg px-4 py-2 bg-background text-foreground shadow-lg">
                  {formatPrice(event.amount, event.currency)}
                </Badge>
              </div>
            </div>

            {/* Event Details */}
            <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {event.name}
                </h2>

                {event.content && (
                  <div
                    dangerouslySetInnerHTML={{ __html: event.content }}
                    className="text-sm text-muted-foreground line-clamp-2"
                  ></div>
                )}
              </div>

              {/* Join Button */}
              <div className="pt-4">
                <Button
                  onClick={() => setShowPayment(true)}
                  size="lg"
                  className="w-full lg:w-auto text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  इवेंट से जुड़ें - {formatPrice(event.amount, event.currency)}
                </Button>
              </div>
            </div>
          </div>
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

const LandingPageEvents: React.FC = () => {
  const { data: eventsData, isLoading } = useEvents();

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-[600px] bg-muted rounded-2xl"></div>
          </div>
        </div>
      </section>
    );
  }

  const events = eventsData?.data || [];

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            आगामी कार्यक्रम
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            हमारे विशेष कार्यक्रमों में शामिल हों और उद्योग विशेषज्ञों से जुड़ें
          </p>
        </div>

        {events.length === 1 ? (
          <EventCard event={events[0]} />
        ) : (
          <Carousel className="w-full max-w-7xl mx-auto">
            <CarouselContent>
              {events.map((event, index) => (
                <CarouselItem key={event._id}>
                  <EventCard event={event} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        )}
      </div>
    </section>
  );
};

export default LandingPageEvents;
