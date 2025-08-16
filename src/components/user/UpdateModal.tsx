import { useCourses } from "@/hooks/useCourses";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { AuthIdentifiers } from "@/types/constants";
import {
  userCreateFormData,
  userCreateValidations,
  userUpdateFormValidations,
  userUpdateModalFormData,
} from "@/types/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import Modal from "../common/CustomDialog";
import CustomImage from "../common/CustomImage";
import { FormCheckbox } from "../common/FormCheckBox";
import { FormInput } from "../common/FormInput";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Checkbox } from "../ui/checkbox";
import { Form } from "../ui/form";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: userUpdateModalFormData | null;
  userId?: string | null;
}

const defaultValues: userCreateFormData = {
  identifier: AuthIdentifiers.email,
  firstName: "",
  lastName: "",
  email: "",
  mobileNumber: "",
  password: "",
  confirmPassword: "",
  isBlocked: false,
  isVerified: false,
};

const AddCourse = ({
  form,
  userId,
}: {
  form: UseFormReturn<userUpdateModalFormData | userCreateFormData>;
  userId?: string | null;
}) => {
  const [page, setPage] = useState(1);
  const { data: courses, isLoading } = useCourses({
    page,
    limit: 10,
    userId,
    isIncludePurchased: true,
  });

  const totalPages = courses?.data?.pagination?.totalPages || 1;
  const purchasedCourses: string[] = form.watch("purchasedCourses") || [];

  const toggleCourse = (courseId: string) => {
    const current = purchasedCourses || [];
    if (current.includes(courseId)) {
      form.setValue(
        "purchasedCourses",
        current.filter((id) => id !== courseId)
      );
    } else {
      form.setValue("purchasedCourses", [...current, courseId]);
    }
  };

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full mb-5"
      defaultValue="item-1"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="border px-3 mb-4">
          Purchased Courses
        </AccordionTrigger>
        <AccordionContent className="flex flex-col gap-4">
          {isLoading && <p>Loading courses...</p>}
          {courses?.data?.items?.map((course) => (
            <label
              key={course._id}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <Checkbox
                id={`course-${course._id}`}
                checked={purchasedCourses.includes(course._id)}
                onCheckedChange={() => toggleCourse(course._id)}
              />
              <div className="flex items-start gap-2">
                <CustomImage
                  src={course?.thumbnail?.url}
                  alt={course.name}
                  className="h-10 w-10 rounded-md"
                />
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="line-clamp-2 text-[9px]">
                    {course.description}
                  </p>
                </div>
              </div>
            </label>
          ))}
          {/* Optional: pagination buttons */}
          <div className="flex justify-between mt-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const UpdateModal: React.FC<ModalProps> = ({ data, userId, ...props }) => {
  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  type FormValues = userCreateFormData | userUpdateModalFormData;

  const form = useForm<FormValues>({
    defaultValues: data ?? defaultValues,
    resolver: zodResolver(
      data ? userUpdateFormValidations : userCreateValidations
    ),
    mode: "onChange",
  });

  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data, form]);

  const handleSubmit: SubmitHandler<FormValues> = async (formData) => {
    if (data) {
      await updateUser({
        data: formData as userUpdateModalFormData,
        userId: userId,
      }).then(() => {
        props.onClose();
        form.reset();
      });
    } else {
      await createUser(formData as userCreateFormData).then(() => {
        props.onClose();
        form.reset();
      });
    }
  };

  console.log(form.getValues(), form.formState.errors);

  return (
    <Modal
      {...props}
      onConfirm={form.handleSubmit(handleSubmit)}
      confirmText={
        data
          ? isUpdating
            ? "Updating..."
            : "Update"
          : isCreating
          ? "Creating..."
          : "Create"
      }
      isLoading={isUpdating || isCreating}
      title={data ? "Update User" : "Create User"}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="grid grid-cols-1 space-y-2 mt-5"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-2">
            <FormInput<FormValues>
              type="text"
              name="firstName"
              placeholder="Enter First Name"
              label="First Name"
              control={form.control}
            />
            <FormInput<FormValues>
              type="text"
              name="lastName"
              placeholder="Enter Last Name"
              label="Last Name"
              control={form.control}
            />
          </div>
          <FormInput<FormValues>
            type="text"
            name="email"
            placeholder="Enter Email"
            label="Email"
            control={form.control}
          />

          {!data && (
            <>
              <FormInput<FormValues>
                type="text"
                name="password"
                placeholder="Enter Password"
                label="Password"
                control={form.control}
              />
              <FormInput<FormValues>
                type="text"
                name="confirmPassword"
                placeholder="Confirm Password"
                label="Confirm Password"
                control={form.control}
              />
            </>
          )}

          <AddCourse form={form} userId={userId} />

          <FormCheckbox<FormValues>
            name="isBlocked"
            control={form.control}
            label="Is Blocked"
            helperText="User will not be able to log in if blocked"
          />
          <FormCheckbox<FormValues>
            name="isVerified"
            control={form.control}
            label="Is Verified"
            helperText="User has verified their email"
          />
        </form>
      </Form>
    </Modal>
  );
};

export default UpdateModal;
