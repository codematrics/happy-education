"use client";

import { useEventRegistrations } from "@/hooks/useEventRegistrations";
import { useEvents } from "@/hooks/useEvents";
import { EventRegistrationStatus } from "@/types/constants";
import { formatDate } from "@/utils/date";
import { ExternalLink, Filter, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { CustomPagination } from "../common/CustomPagination";
import LoadingError from "../common/LoadingError";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Props {
  initialPage: number;
}

const EventRegistrationsList: React.FC<Props> = ({ initialPage }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(initialPage);

  // Get filter values from URL
  const eventId = searchParams.get("eventId") || "";
  const fromDate = searchParams.get("fromDate") || "";
  const toDate = searchParams.get("toDate") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";

  // State for filters
  const [filters, setFilters] = useState({
    eventId,
    fromDate,
    toDate,
    paymentStatus,
  });

  const limit = 10;

  // Fetch registrations data
  const { data, isLoading, refetch } = useEventRegistrations({
    page,
    limit,
    eventId: filters.eventId || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    paymentStatus: filters.paymentStatus || undefined,
  });

  // Fetch events for filter dropdown
  const { data: eventsData } = useEvents();
  const events = eventsData?.data || [];

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");

    if (filters.eventId) params.set("eventId", filters.eventId);
    if (filters.fromDate) params.set("fromDate", filters.fromDate);
    if (filters.toDate) params.set("toDate", filters.toDate);
    if (filters.paymentStatus)
      params.set("paymentStatus", filters.paymentStatus);

    router.push(`/admin/event-registrations?${params.toString()}`);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      eventId: "",
      fromDate: "",
      toDate: "",
      paymentStatus: "",
    });
    router.push("/admin/event-registrations");
    setPage(1);
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      [EventRegistrationStatus.paid]: "default",
      [EventRegistrationStatus.pending]: "secondary",
      [EventRegistrationStatus.failed]: "destructive",
    };

    const colors: Record<string, string> = {
      [EventRegistrationStatus.paid]:
        "bg-green-100 text-green-800 border-green-200",
      [EventRegistrationStatus.pending]:
        "bg-yellow-100 text-yellow-800 border-yellow-200",
      [EventRegistrationStatus.failed]:
        "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <Badge className={colors[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatPrice = (amount: number, currency: string) => {
    const symbol = currency === "dollar" ? "$" : "₹";
    return `${symbol}${amount}`;
  };

  return (
    <>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Event Registrations
          </h1>
          <p className="text-muted-foreground">
            Manage and track event registrations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {/* Event Filter */}
            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Event</label>
              <Select
                value={filters.eventId}
                onValueChange={(value) => handleFilterChange("eventId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Events</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}

            {/* From Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              />
            </div>

            {/* To Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
              />
            </div>

            {/* Payment Status */}
            {/* <div className="space-y-2">
              <label className="text-sm font-medium">Payment Status</label>
              <Select
                value={filters.paymentStatus}
                onValueChange={(value) =>
                  handleFilterChange("paymentStatus", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value={EventRegistrationStatus.paid}>
                    Paid
                  </SelectItem>
                  <SelectItem value={EventRegistrationStatus.pending}>
                    Pending
                  </SelectItem>
                  <SelectItem value={EventRegistrationStatus.failed}>
                    Failed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* Filter Actions */}
            <div className="space-y-2 flex flex-col justify-end">
              <Button onClick={applyFilters} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <LoadingError
          isLoading={isLoading}
          errorTitle="Error loading registrations"
          onRetry={refetch}
          skeleton={
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="animate-pulse bg-muted h-16 rounded-lg"
                ></div>
              ))}
            </div>
          }
        >
          {(data?.data?.items?.length ?? 0) > 0 ? (
            <>
              <div className="bg-card rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.data?.items?.map((registration: any) => (
                      <TableRow key={registration._id}>
                        <TableCell>
                          <div
                            className="cursor-pointer hover:text-primary transition-colors"
                            onClick={() =>
                              handleEventClick(registration.eventId._id)
                            }
                          >
                            <div className="font-medium">
                              {registration.eventId.name}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">{registration.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {registration.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(registration.updatedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(registration.paymentStatus)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatPrice(
                              registration.amount,
                              registration.currency
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleEventClick(registration.eventId._id)
                            }
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Event
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data?.data?.pagination && (
                <CustomPagination
                  {...data.data.pagination}
                  onPageChange={(newPage) => {
                    setPage(newPage);
                    const params = new URLSearchParams(window.location.search);
                    params.set("page", newPage.toString());
                    router.push(
                      `/admin/event-registrations?${params.toString()}`
                    );
                  }}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border">
              <div className="text-muted-foreground text-lg">
                No registrations found
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Event registrations will appear here once users register for
                events
              </p>
            </div>
          )}
        </LoadingError>
      </div>
    </>
  );
};

export default EventRegistrationsList;
