import UpdateOrCreateEvent from "@/components/events/UpdateOrCreateModal";

const UpdateEvent = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <UpdateOrCreateEvent eventId={id} />;
};

export default UpdateEvent;
