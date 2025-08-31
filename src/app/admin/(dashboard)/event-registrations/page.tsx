import EventRegistrationsList from "@/components/event-registrations/EventRegistrationsList";
import { getEventRegistrations, getEvents } from "@/lib/api";
import { getQueryClient } from "@/lib/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function EventRegistrationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ 
    page?: string; 
    eventId?: string; 
    fromDate?: string; 
    toDate?: string;
    paymentStatus?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params?.page ?? "1");
  const eventId = params?.eventId;
  const fromDate = params?.fromDate;
  const toDate = params?.toDate;
  const paymentStatus = params?.paymentStatus;
  const pageSize = 10;

  const queryClient = getQueryClient();

  // Prefetch event registrations
  await queryClient.prefetchQuery({
    queryKey: ["event-registrations", page, pageSize, eventId, fromDate, toDate, paymentStatus],
    queryFn: () => getEventRegistrations(page, pageSize, eventId, fromDate, toDate, paymentStatus),
  });

  // Prefetch events for filter dropdown
  await queryClient.prefetchQuery({
    queryKey: ["events"],
    queryFn: getEvents,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6 space-y-6">
        <EventRegistrationsList initialPage={page} />
      </div>
    </HydrationBoundary>
  );
}