"use client";

import { useEvents } from "@/hooks/useEvents";
import { Event } from "@/types/types";
import { formatDate } from "@/utils/date";
import { Calendar, ExternalLink, Repeat } from "lucide-react";
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
            {/* Price Badge */}
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
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Event Meta Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(event.day)}</span>
              {event.repeating && (
                <Badge variant="outline" className="text-xs">
                  <Repeat className="h-3 w-3 mr-1" />
                  Repeating
                </Badge>
              )}
            </div>
          </div>

          {/* Benefits Preview */}
          {event.benefits && event.benefits.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-1">
                {event.benefits.slice(0, 2).map((benefit, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {benefit.length > 15
                      ? `${benefit.substring(0, 15)}...`
                      : benefit}
                  </Badge>
                ))}
                {event.benefits.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{event.benefits.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Join Button */}
          <Button
            onClick={() => setShowPayment(true)}
            className="w-full mt-4"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Join Event
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
        <h2 className="text-3xl font-bold">Upcoming Events</h2>
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Don't Miss Our Events</h2>
        <p className="text-muted-foreground">
          Connect with experts and expand your knowledge
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
