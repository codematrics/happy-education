import { DropdownProps, Event } from "@/types/types";
import { formatDate } from "@/utils/date";
import {
  Calendar,
  Edit,
  ExternalLink,
  MoreHorizontal,
  Repeat,
  Trash2,
} from "lucide-react";
import React from "react";
import CustomDropdown from "../common/CustomDropdown";
import CustomImage from "../common/CustomImage";
import { Badge } from "../ui/badge";
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
  const eventDropdownData: DropdownProps = {
    label: <MoreHorizontal className="h-4 w-4" />,
    options: [
      {
        label: "Edit",
        action: () => onEdit && onEdit(event),
        icon: Edit,
      },
      {
        label: "Delete",
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
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description}
              </p>
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
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatDate(event.day)}</span>
            {event.repeating && (
              <Badge variant="outline" className="text-xs">
                <Repeat className="h-3 w-3 mr-1" />
                Every {event.repeatEvery} day
                {event.repeatEvery !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              {formatPrice(event.amount, event.currency)}
            </span>
          </div>
        </div>

        {/* Benefits */}
        {event.benefits && event.benefits.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Benefits:</h4>
            <div className="flex flex-wrap gap-1">
              {event.benefits.slice(0, 3).map((benefit, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {benefit}
                </Badge>
              ))}
              {event.benefits.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.benefits.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Join Button */}
        <Button onClick={handleJoinEvent} className="w-full" size="sm">
          <ExternalLink className="h-4 w-4 mr-2" />
          Join Event
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventCard;
