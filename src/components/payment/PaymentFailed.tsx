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
      handleBackToCourse();
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-red-700 dark:text-red-400">
            भुगतान असफल
          </CardTitle>
          <CardDescription>
            आपका भुगतान संसाधित नहीं हो सका। कृपया पुनः प्रयास करें।
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Details */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg">
              <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">
                त्रुटि विवरण
              </h4>
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Order Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            {courseName && (
              <div className="mb-3">
                <h4 className="font-semibold mb-1">कोर्स</h4>
                <p className="text-sm text-muted-foreground">{courseName}</p>
              </div>
            )}
            {orderId && (
              <div>
                <h4 className="font-semibold mb-1">ऑर्डर आईडी</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  {orderId}
                </p>
              </div>
            )}
          </div>

          {/* Common Issues */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
              आम कारण
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• खाते में अपर्याप्त शेष राशि</li>
              <li>• कार्ड समाप्त या अवरुद्ध</li>
              <li>• नेटवर्क कनेक्टिविटी समस्याएँ</li>
              <li>• भुगतान विधि समर्थित नहीं</li>
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
              पुनः प्रयास करें
            </Button>

            <Button
              variant="outline"
              onClick={handleBackToCourse}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              कोर्स पर लौटें
            </Button>
          </div>

          {/* Support Info */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              अभी भी समस्या है?
            </p>
            <Button
              variant="link"
              onClick={() => router.push("/contact")}
              className="text-sm"
            >
              सपोर्ट से संपर्क करें
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;
