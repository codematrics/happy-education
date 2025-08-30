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
import { ScrollArea } from "../ui/scroll-area";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  confirmText?: string;
  onConfirm?: () => void;
  cancelText?: string;
  showCancel?: boolean;
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = "सत्यापित करें",
  cancelText = "रद्द करें",
  onConfirm,
  showCancel = true,
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background border border-primary rounded-xl shadow-lg p-0 gap-0">
        {title && (
          <DialogHeader className="px-6 py-4">
            <DialogTitle className="text-primary text-lg font-semibold">
              {title}
            </DialogTitle>
          </DialogHeader>
        )}

        {/* Only one scrollbar (inside here) */}
        <ScrollArea className="px-4 max-h-[60vh] text-foreground">
          <div className="px-2">{children}</div>
        </ScrollArea>

        <DialogFooter className="flex justify-end gap-3 px-6 py-4">
          {showCancel && (
            <Button
              variant="outline"
              className="text-primary hover:bg-primary hover:text-background"
              onClick={onClose}
            >
              {cancelText}
            </Button>
          )}
          {onConfirm && (
            <Button
              disabled={isLoading}
              className="bg-primary text-background hover:bg-primary"
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
