"use client";

import ModalRoot from "@/components/common/ModalRoot";
import { ModalProvider } from "@/context/CheckOutContext";
import { getQueryClient } from "@/lib/query";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

const queryClient = getQueryClient();

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ModalProvider>
        {children}
        <ModalRoot />
      </ModalProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default Providers;
