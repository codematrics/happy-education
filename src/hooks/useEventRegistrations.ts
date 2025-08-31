"use client";

import { getEventRegistrations } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface UseEventRegistrationsParams {
  page?: number;
  limit?: number;
  eventId?: string;
  fromDate?: string;
  toDate?: string;
  paymentStatus?: string;
}

export const useEventRegistrations = ({
  page = 1,
  limit = 10,
  eventId,
  fromDate,
  toDate,
  paymentStatus,
}: UseEventRegistrationsParams = {}) => {
  return useQuery({
    queryKey: ["event-registrations", page, limit, eventId, fromDate, toDate, paymentStatus],
    queryFn: () => getEventRegistrations(page, limit, eventId, fromDate, toDate, paymentStatus),
  });
};