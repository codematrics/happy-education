import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
}

const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = "Are you sure you want to delete? This action cannot be undone and will permanently remove this and all associated data.",
}: DeleteConfirmDialogProps) => {
  const [deleting, setDeleting] = useState<boolean>(false);
  const handleConfirm = async () => {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;
