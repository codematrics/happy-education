"use client";

import { useBlockUser, useUsers, useVerifyUser } from "@/hooks/useUsers";
import { coursesSortOptions } from "@/types/constants";
import { userUpdateModalFormData } from "@/types/schema";
import { DropdownProps, User } from "@/types/types";
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
    setUpdateModal({
      isOpen: true,
      onClose: closeCreateUpdateModal,
      data: data as unknown as userUpdateModalFormData,
      userId: data._id,
    });
  };

  const userDropdownData: DropdownProps = {
    label: <MoreHorizontal className="h-4 w-4" />,
    options: [
      {
        label: "Edit User",
        action: (data: User) => openUpdateModal(data),
        icon: Edit,
      },
      {
        label: "Mark As Verified",
        action: async (data) => data?._id && (await verifyUser(data._id)),
        icon: CheckCheck,
      },
      {
        label: "Block User",
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
      cell: ({ row }) => {
        return "#" + String(row.index + 1);
      },
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
    },

    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email") || "-",
    },
    {
      accessorKey: "mobileNumber",
      header: "Mobile Number",
      cell: ({ row }) => row.getValue("mobileNumber") || "-",
    },
    {
      accessorKey: "purchasedCount",
      header: "Purchased Courses",
      cell: ({ row }) => row.getValue("purchasedCount") || "-",
    },
    {
      accessorKey: "createdAt",
      header: "Creation Date",
      cell: ({ row }) => row.getValue("createdAt") || "-",
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }) => {
        return row.getValue("isVerified") ? (
          <CheckCheck className="h-4 w-4 text-blue-600" />
        ) : (
          <X className="h-4 w-4 text-destructive" />
        );
      },
    },
    {
      accessorKey: "isBlocked",
      header: "Blocked",
      cell: ({ row }) => {
        return row.getValue("isBlocked") ? (
          <CheckCheck className="h-4 w-4 text-blue-600" />
        ) : (
          <X className="h-4 w-4 text-destructive" />
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
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
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage your user accounts</p>
        </div>
        <Button
          onClick={openCreationModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
        errorTitle="Error loading Users"
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
                ? "No Users found matching your search."
                : "No Users available."}
            </div>
            {!search && (
              <Button className="mt-4">Create Your First User</Button>
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
        title="Block User"
        description="Are you sure you want to block this user?"
      />
    </>
  );
};

export default UserPage;
