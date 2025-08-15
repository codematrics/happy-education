"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  showCancel?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  showCancel = true,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[var(--background)] border border-[var(--primary)] rounded-xl shadow-lg p-6">
        {title && (
          <DialogHeader>
            <DialogTitle className="text-[var(--primary)] text-lg font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>
        )}

        <div className="my-4 text-[var(--foreground)]">{children}</div>

        <DialogFooter className="flex justify-end gap-3">
          {showCancel && (
            <Button
              variant="outline"
              className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)]"
              onClick={onClose}
            >
              {cancelText}
            </Button>
          )}
          {onConfirm && (
            <Button
              className="bg-[var(--primary)] text-[var(--background)] hover:bg-[var(--primary-hover)]"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
