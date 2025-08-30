"use client";

import { getEvents as getEventsAPI } from "@/lib/api";
import { EventFormData } from "@/types/schema";
import { Event } from "@/types/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE = "/api/v1/events";

const getEventById = async (id: string): Promise<Event> => {
  const response = await fetch(`${API_BASE}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch event");
  }
  return response.json();
};

const createEvent = async (data: EventFormData): Promise<Event> => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create event");
  }

  return response.json();
};

const updateEvent = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<EventFormData>;
}): Promise<Event> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update event");
  }

  return response.json();
};

const deleteEvent = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete event");
  }
};

// Hooks
export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: getEventsAPI,
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create event");
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEvent,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events", variables.id] });
      toast.success("Event updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update event");
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete event");
    },
  });
};
