import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-dvh flex items-center justify-center md:mt-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl shadow-strong p-3 md:p-8 md:border">
            {children}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Join thousands of learners already improving their skills
            </p>
            <div className="flex justify-center space-x-8 text-xs text-muted-foreground">
              <div>✓ Lifetime Access</div>
              <div>✓ Expert Instructors</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
