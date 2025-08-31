"use client";

import "@/components/tiptap-node/blockquote-node/blockquote-node.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-templates/simple/simple-editor.scss";

import { DropdownProps, Event } from "@/types/types";
import { Edit, ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import CustomDropdown from "../common/CustomDropdown";
import CustomImage from "../common/CustomImage";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

interface Props {
  event: Event;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  showMoreMenu?: boolean;
}

const EventCard: React.FC<Props> = ({
  event,
  showMoreMenu = false,
  onDelete,
  onEdit,
}) => {
  const router = useRouter();
  const eventDropdownData: DropdownProps = {
    label: <MoreHorizontal className="h-4 w-4" />,
    options: [
      {
        label: "Link",
        action: () => router.push(`/event/${event._id}`),
        icon: Edit,
      },
      {
        label: "संपादित करें",
        action: () => router.push(`/admin/events/${event._id}`),
        icon: Edit,
      },
      {
        label: "हटाएँ",
        action: () => onDelete && onDelete(event._id),
        icon: Trash2,
        itemClassName: "text-destructive hover:text-destructive",
      },
    ],
  };

  const handleJoinEvent = () => {
    window.open(event.joinLink, "_blank");
  };

  const formatPrice = (price: number, currency: "dollar" | "rupee") => {
    const symbol = currency === "dollar" ? "$" : "₹";
    return `${symbol}${price.toFixed(2)}`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-none shadow-sm bg-card">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate mb-1">
              {event.name}
            </h3>
            {event.content && (
              <div
                dangerouslySetInnerHTML={{ __html: event.content }}
                className="text-sm text-muted-foreground line-clamp-2"
              ></div>
            )}
          </div>
          {showMoreMenu && (
            <div className="ml-2">
              <CustomDropdown {...eventDropdownData} />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        {/* Event Image */}
        {event.image && (
          <div className="relative overflow-hidden rounded-lg">
            <CustomImage src={event.image?.url} alt={event.name} />
          </div>
        )}

        {/* Event Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              {formatPrice(event.amount, event.currency)}
            </span>
          </div>
        </div>

        {/* Join Button */}
        {event.joinLink && (
          <Button onClick={handleJoinEvent} className="w-full" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            इवेंट में शामिल हों
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
