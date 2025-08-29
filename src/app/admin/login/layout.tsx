import React from "react";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-dvh grid grid-cols-1 justify-center items-center">
      {children}
    </div>
  );
};

export default AdminLayout;
