"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorCard = ({
  title = "कुछ गलत हो गया",
  message = "हम कोर्स डेटा लोड नहीं कर पाए। कृपया पुनः प्रयास करें।",
  onRetry,
}: ErrorCardProps) => {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="flex flex-col items-center text-center space-y-2">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <h3 className="font-semibold text-lg text-destructive">{title}</h3>
      </CardHeader>

      <CardContent className="text-sm text-muted-foreground text-center">
        {message}
      </CardContent>

      {onRetry && (
        <CardFooter className="flex justify-center">
          <Button variant="destructive" onClick={onRetry} className="px-6">
            पुनः प्रयास करें
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ErrorCard;
