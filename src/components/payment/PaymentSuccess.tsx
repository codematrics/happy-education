"use client";

import { CheckCircle, Download, Eye, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface PaymentSuccessProps {
  transactionId?: string;
  courseId?: string;
  courseName?: string;
  isNewUser?: boolean;
  userEmail?: string;
}

const PaymentSuccess = ({
  transactionId,
  courseId,
  courseName,
  isNewUser = false,
  userEmail,
}: PaymentSuccessProps) => {
  const router = useRouter();

  const handleStartLearning = () => {
    if (courseId) {
      router.push(`/videos/${courseId}`);
    }
  };

  const handleViewCourse = () => {
    if (courseId) {
      router.push(`/course/${courseId}`);
    }
  };

  const handleDownloadReceipt = () => {
    if (transactionId) {
      window.open(
        `/api/v1/user/transactions/${transactionId}/receipt`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-700 dark:text-green-400">
            भुगतान सफल!
          </CardTitle>
          <CardDescription>
            {isNewUser
              ? "आपका अकाउंट बनाया गया है और कोर्स का एक्सेस मिल गया है"
              : "आपकी कोर्स खरीदारी सफलतापूर्वक पूरी हो गई"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Course Info */}
          {courseName && (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <h3 className="font-semibold mb-2">खरीदा गया कोर्स</h3>
              <p className="text-sm text-muted-foreground">{courseName}</p>
            </div>
          )}

          {/* New User Info */}
          {isNewUser && userEmail && (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                अकाउंट बनाया गया
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                हमने आपके लिए एक अकाउंट बनाया है और लॉगिन विवरण भेजे हैं:{" "}
                <span className="font-semibold">{userEmail}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {courseId && (
              <Button
                onClick={handleStartLearning}
                className="w-full gradient-primary text-white"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                अभी सीखना शुरू करें
              </Button>
            )}

            <div className="grid grid-cols-2 gap-3">
              {courseId && (
                <Button variant="outline" onClick={handleViewCourse}>
                  <Eye className="w-4 h-4 mr-2" />
                  कोर्स देखें
                </Button>
              )}

              {transactionId && (
                <Button variant="outline" onClick={handleDownloadReceipt}>
                  <Download className="w-4 h-4 mr-2" />
                  रसीद डाउनलोड करें
                </Button>
              )}
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2 pt-4 border-t">
            <Button
              variant="link"
              onClick={() => router.push("/my-courses")}
              className="text-sm"
            >
              मेरे सभी कोर्स देखें
            </Button>
            <br />
            <Button
              variant="link"
              onClick={() => router.push("/profile")}
              className="text-sm"
            >
              प्रोफाइल पर जाएं
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
