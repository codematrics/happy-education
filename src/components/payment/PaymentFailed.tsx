"use client";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface PaymentFailedProps {
  courseId?: string;
  courseName?: string;
  error?: string;
  orderId?: string;
  onRetry?: () => void;
}

const PaymentFailed = ({
  courseId,
  courseName,
  error,
  orderId,
  onRetry,
}: PaymentFailedProps) => {
  const router = useRouter();

  const handleBackToCourse = () => {
    if (courseId) {
      router.push(`/course/${courseId}`);
    } else {
      router.push("/courses");
    }
  };

  const handleRetryPayment = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Fallback to course page to retry
      handleBackToCourse();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-700 dark:text-red-400">
            Payment Failed
          </CardTitle>
          <CardDescription>
            We couldn't process your payment. Please try again.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Details */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
              <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                Error Details
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Order Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            {courseName && (
              <div className="mb-3">
                <h4 className="font-semibold mb-1">Course</h4>
                <p className="text-sm text-muted-foreground">{courseName}</p>
              </div>
            )}
            {orderId && (
              <div>
                <h4 className="font-semibold mb-1">Order ID</h4>
                <p className="text-sm text-muted-foreground font-mono">{orderId}</p>
              </div>
            )}
          </div>

          {/* Common Issues */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
              Common Issues
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Insufficient balance in account</li>
              <li>• Card expired or blocked</li>
              <li>• Network connectivity issues</li>
              <li>• Payment method not supported</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleRetryPayment}
              className="w-full gradient-primary text-white"
              size="lg"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button
              variant="outline"
              onClick={handleBackToCourse}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Still having trouble?
            </p>
            <Button
              variant="link"
              onClick={() => router.push("/contact")}
              className="text-sm"
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;