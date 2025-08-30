"use client";

import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types/types";
import { formatDate } from "@/utils/date";
import { Calendar, ExternalLink, Repeat } from "lucide-react";
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

                {event.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Event Meta Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-medium">{formatDate(event.day)}</span>
                  {event.repeating && (
                    <Badge variant="outline" className="text-sm">
                      <Repeat className="h-3 w-3 mr-1" />
                      Every {event.repeatEvery} day
                      {event.repeatEvery !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Benefits */}
              {event.benefits && event.benefits.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">
                    What you'll get:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {event.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Join Button */}
              <div className="pt-4">
                <Button
                  onClick={() => setShowPayment(true)}
                  size="lg"
                  className="w-full lg:w-auto text-lg px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Join Event - {formatPrice(event.amount, event.currency)}
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
            Upcoming Events
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our exclusive events and connect with industry experts
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
