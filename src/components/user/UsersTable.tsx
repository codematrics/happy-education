"use client";

import { useBlockUser, useUsers, useVerifyUser } from "@/hooks/useUsers";
import { coursesSortOptions } from "@/types/constants";
import { userUpdateModalFormData } from "@/types/schema";
import { Course, DropdownProps, User } from "@/types/types";
import { getSortParams } from "@/utils/data";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCheck,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  ShieldX,
  X,
} from "lucide-react";
import React, { useState } from "react";
import CustomDropdown from "../common/CustomDropdown";
import { CustomPagination } from "../common/CustomPagination";
import { CustomTable } from "../common/CustomTable";
import DeleteConfirmDialog from "../common/DeleteConfirmation";
import LoadingError from "../common/LoadingError";
import { CustomTableSkeleton } from "../skeleton/CustomTable";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import UpdateModal from "./UpdateModal";

interface Props {
  initialSearch: string;
  initialPage: number;
}

interface BlockConfirmationProps {
  isOpen: boolean;
  userId: string;
  userName: string;
  onBlock: () => void | Promise<void>;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: userUpdateModalFormData | null;
  userId: string | null;
}

const UserPage: React.FC<Props> = ({ initialSearch, initialPage }) => {
  const [updateModal, setUpdateModal] = useState<UpdateModalProps>({
    isOpen: false,
    onClose: () => setUpdateModal((prev) => ({ ...prev, isOpen: false })),
    data: null,
    userId: null,
  });
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [sort, setSort] = useState("newest");
  const [blockConfirmation, setBlockConfirmation] =
    useState<BlockConfirmationProps>({
      isOpen: false,
      userId: "",
      userName: "",
      onBlock: () => {},
    });

  const limit = 10;
  const sortParams = getSortParams(sort);
  const { mutateAsync: blockUser } = useBlockUser();
  const { mutateAsync: verifyUser } = useVerifyUser();
  const { data, isLoading, refetch } = useUsers({
    page,
    limit,
    search,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
  });

  const closeCreateUpdateModal = () =>
    setUpdateModal((pre) => ({
      ...pre,
      isOpen: false,
      data: null,
      userId: null,
    }));

  const openCreationModal = () => {
    setUpdateModal({
      isOpen: true,
      onClose: closeCreateUpdateModal,
      data: null,
      userId: null,
    });
  };

  const openUpdateModal = (data: User) => {
    const courseIds = Array.isArray(data.purchasedCourses)
      ? data.purchasedCourses.map((course: any) => course._id || course)
      : [(data.purchasedCourses as Course)._id || data.purchasedCourses].filter(
          Boolean
        );

    const formData: userUpdateModalFormData = {
      ...data,
      purchasedCourses: courseIds,
      selectedCourse: data.purchasedCourses,
    };
    setUpdateModal({
      isOpen: true,
      onClose: closeCreateUpdateModal,
      data: formData,
      userId: data._id,
    });
  };

  const userDropdownData: DropdownProps = {
    label: <MoreHorizontal className="h-4 w-4" />,
    options: [
      {
        label: "उपयोगकर्ता संपादित करें",
        action: (data: User) => openUpdateModal(data),
        icon: Edit,
      },
      {
        label: "सत्यापित के रूप में चिह्नित करें",
        action: async (data) => data?._id && (await verifyUser(data._id)),
        icon: CheckCheck,
      },
      {
        label: "उपयोगकर्ता ब्लॉक करें",
        action: (data) =>
          setBlockConfirmation({
            isOpen: true,
            userId: data._id,
            userName: data.name,
            onBlock: async () => {
              await blockUser(data._id);
              setBlockConfirmation({
                isOpen: false,
                userId: "",
                userName: "",
                onBlock: () => {},
              });
            },
          }),
        icon: ShieldX,
        itemClassName: "text-destructive hover:text-destructive",
        iconClassName: "text-destructive",
      },
    ],
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "rowNumber",
      header: "#",
      cell: ({ row }) => "#" + String(row.index + 1),
    },
    {
      accessorKey: "fullName",
      header: "पूरा नाम",
    },
    {
      accessorKey: "email",
      header: "ईमेल",
      cell: ({ row }) => row.getValue("email") || "-",
    },
    {
      accessorKey: "mobileNumber",
      header: "मोबाइल नंबर",
      cell: ({ row }) => row.getValue("mobileNumber") || "-",
    },
    {
      accessorKey: "purchasedCount",
      header: "खरीदे गए कोर्स",
      cell: ({ row }) => row.getValue("purchasedCount") || "-",
    },
    {
      accessorKey: "createdAt",
      header: "निर्माण तिथि",
      cell: ({ row }) => row.getValue("createdAt") || "-",
    },
    {
      accessorKey: "isVerified",
      header: "सत्यापित",
      cell: ({ row }) =>
        row.getValue("isVerified") ? (
          <CheckCheck className="h-4 w-4 text-blue-600" />
        ) : (
          <X className="h-4 w-4 text-destructive" />
        ),
    },
    {
      accessorKey: "isBlocked",
      header: "ब्लॉक",
      cell: ({ row }) =>
        row.getValue("isBlocked") ? (
          <CheckCheck className="h-4 w-4 text-blue-600" />
        ) : (
          <X className="h-4 w-4 text-destructive" />
        ),
    },
    {
      accessorKey: "actions",
      header: "क्रियाएँ",
      cell: ({ row }) => (
        <CustomDropdown {...userDropdownData} data={row.original} />
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (value: string) => {
    setSort(value);
    setPage(1);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">उपयोगकर्ता</h1>
          <p className="text-muted-foreground">
            अपने उपयोगकर्ता खातों का प्रबंधन करें
          </p>
        </div>
        <Button
          onClick={openCreationModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          उपयोगकर्ता बनाएँ
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="उपयोगकर्ताओं को खोजें..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select value={sort} onValueChange={handleSort}>
            <SelectTrigger className="w-40 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {coursesSortOptions.map((options) => (
                <SelectItem key={options.value} value={options.value}>
                  {options.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <LoadingError
        isLoading={isLoading}
        errorTitle="उपयोगकर्ताओं को लोड करने में त्रुटि"
        onRetry={refetch}
        skeleton={<CustomTableSkeleton columns={columns.length} />}
      >
        {(data?.data?.items?.length ?? 0) > 0 ? (
          <>
            <CustomTable data={data?.data?.items || []} columns={columns} />
            {data?.data?.pagination && (
              <CustomPagination
                {...data?.data?.pagination}
                onPageChange={(page) => setPage(page)}
              />
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              {search
                ? "कोई उपयोगकर्ता खोज से मेल नहीं खाता।"
                : "कोई उपयोगकर्ता उपलब्ध नहीं है।"}
            </div>
            {!search && (
              <Button className="mt-4">अपना पहला उपयोगकर्ता बनाएँ</Button>
            )}
          </div>
        )}
      </LoadingError>

      <UpdateModal
        isOpen={updateModal.isOpen}
        onClose={updateModal.onClose}
        data={updateModal.data}
        userId={updateModal.userId}
      />

      <DeleteConfirmDialog
        isOpen={blockConfirmation.isOpen}
        onClose={() =>
          setBlockConfirmation({
            isOpen: false,
            userId: "",
            userName: "",
            onBlock: () => {},
          })
        }
        onConfirm={blockConfirmation.onBlock}
        title="उपयोगकर्ता ब्लॉक करें"
        description="क्या आप सुनिश्चित हैं कि आप इस उपयोगकर्ता को ब्लॉक करना चाहते हैं?"
      />
    </>
  );
};

export default UserPage;
