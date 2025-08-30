"use client";

import FullPageLoader from "@/components/skeleton/FullPageLoader";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type ModalType = "checkout" | "payment" | null;

type ModalState = {
  type: ModalType;
  props?: any;
};

type ModalContextType = {
  modal: ModalState;
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
  setShowPaymentLoading: Dispatch<SetStateAction<boolean>>;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [showPaymentLoading, setShowPaymentLoading] = useState<boolean>(false);

  const openModal = (type: ModalType, props?: any) => {
    setModal({ type, props });
  };

  const closeModal = () => {
    setModal({ type: null });
  };

  return (
    <ModalContext.Provider
      value={{ modal, openModal, closeModal, setShowPaymentLoading }}
    >
      <FullPageLoader
        show={showPaymentLoading}
        message="Processing Payment..."
      />
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
}
