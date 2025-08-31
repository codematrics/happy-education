import EventPage from "@/components/events/EventPage";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <EventPage eventId={id} />;
};

export default page;
