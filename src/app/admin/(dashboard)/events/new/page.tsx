import UpdateOrCreateEvent from "@/components/events/UpdateOrCreateModal";
import { CourseCurrency } from "@/types/constants";
import { EventFormData } from "@/types/schema";

const defaultValues: EventFormData = {
  name: "",
  image: { publicId: "", url: "" },
  currency: CourseCurrency.rupee,
  content: "",
  amount: 0,
  joinLink: "",
};

const CreateEvent = () => {
  return <UpdateOrCreateEvent />;
};

export default CreateEvent;
