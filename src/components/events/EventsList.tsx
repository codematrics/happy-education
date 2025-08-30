"use client";

import { useDeleteEvent, useEvents } from "@/hooks/useEvents";
import { EventFormData } from "@/types/schema";
import { Event } from "@/types/types";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import DeleteConfirmDialog from "../common/DeleteConfirmation";
import LoadingError from "../common/LoadingError";
import CourseCardSkeleton from "../skeleton/CourseCard";
import { Button } from "../ui/button";
import EventCard from "./EventCard";
import UpdateModal from "./UpdateOrCreateModal";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onDelete: () => void | Promise<void>;
  eventId: string;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: EventFormData | null;
  eventId: string | null;
}

const EventsList: React.FC = () => {
  const [updateModal, setUpdateModal] = useState<UpdateModalProps>({
    isOpen: false,
    onClose: () => setUpdateModal((prev) => ({ ...prev, isOpen: false })),
    data: null,
    eventId: null,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmDialogProps>({
    isOpen: false,
    eventId: "",
    onDelete: () => {},
  });

  const { mutateAsync: deleteEvent } = useDeleteEvent();
  const { data, isLoading, refetch } = useEvents();

  const handleCreateEvent = () =>
    setUpdateModal((prev) => ({
      ...prev,
      isOpen: true,
      data: null,
      eventId: null,
    }));

  const handleEditEvent = (event: Event) => {
    const formData: EventFormData = {
      name: event.name,
      image: event.image || "",
      description: event.description || "",
      benefits: event.benefits || [],
      amount: event.amount,
      currency: event.currency,
      day: event.day,
      repeating: event.repeating,
      repeatEvery: event.repeatEvery,
      joinLink: event.joinLink,
    };
    setUpdateModal({
      isOpen: true,
      onClose: () => setUpdateModal((prev) => ({ ...prev, isOpen: false })),
      data: formData,
      eventId: event._id,
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setDeleteConfirm({
      isOpen: true,
      eventId,
      onDelete: async () => {
        await deleteEvent(eventId);
        setDeleteConfirm({
          isOpen: false,
          eventId: "",
          onDelete: () => {},
        });
      },
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Events</h1>
          <p className="text-muted-foreground">Manage your events catalog</p>
        </div>
        <Button
          onClick={handleCreateEvent}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      <LoadingError
        skeletonClassName="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        isLoading={isLoading}
        errorTitle="Error loading events"
        onRetry={refetch}
        skeleton={<CourseCardSkeleton />}
      >
        {(data?.data?.length ?? 0) > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.data?.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
                showMoreMenu
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">No events available.</div>
          </div>
        )}
      </LoadingError>

      <UpdateModal
        isOpen={updateModal.isOpen}
        onClose={updateModal.onClose}
        data={updateModal.data}
        eventId={updateModal.eventId}
      />
      <DeleteConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({
            isOpen: false,
            eventId: "",
            onDelete: () => {},
          })
        }
        onConfirm={deleteConfirm.onDelete}
        title="Delete Event"
        description={`Are you sure you want to delete this event? This action cannot be undone and will permanently remove this event and all associated data.`}
      />
    </>
  );
};

export default EventsList;
