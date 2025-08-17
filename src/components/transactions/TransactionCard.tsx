"use client";

import { CourseCurrency } from "@/types/constants";
import {
  Calendar,
  Download,
  DollarSign,
  Eye,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import CustomImage from "../common/CustomImage";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface Transaction {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: "success" | "failed" | "pending";
  paymentMethod: string;
  course: {
    id: string;
    name: string;
    thumbnail: { publicId: string; url: string };
    price: number;
    accessType: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onDownloadReceipt: (transactionId: string) => void;
  isDownloading?: boolean;
}

const TransactionCard = ({ 
  transaction, 
  onDownloadReceipt, 
  isDownloading = false 
}: TransactionCardProps) => {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Completed";
      case "failed":
        return "Failed";
      case "pending":
        return "Processing";
      default:
        return status;
    }
  };

  const getCurrencyIcon = () => {
    return transaction.currency === CourseCurrency.dollar ? (
      <DollarSign className="w-4 h-4" />
    ) : (
      <IndianRupee className="w-4 h-4" />
    );
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getAccessTypeLabel = (accessType: string) => {
    switch (accessType) {
      case "lifetime":
        return "Lifetime Access";
      case "monthly":
        return "30 Days Access";
      case "yearly":
        return "365 Days Access";
      case "free":
        return "Free Access";
      default:
        return "Access";
    }
  };

  const handleViewCourse = () => {
    router.push(`/course/${transaction.course.id}`);
  };

  const handleDownloadReceipt = () => {
    onDownloadReceipt(transaction.id);
  };

  return (
    <div className="p-6 hover:bg-muted/50 transition-colors">
      <div className="flex items-center space-x-4">
        {/* Course Thumbnail */}
        <div className="flex-shrink-0">
          <CustomImage
            src={transaction.course.thumbnail?.url}
            alt={transaction.course.name}
            className="w-16 h-12 object-cover rounded-lg"
          />
        </div>

        {/* Transaction Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                {transaction.course.name}
              </h3>
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(transaction.createdAt)}</span>
                </div>
                <span>•</span>
                <span>{getAccessTypeLabel(transaction.course.accessType)}</span>
                <span>•</span>
                <span className="font-mono">Order #{transaction.orderId}</span>
              </div>

              {transaction.paymentMethod && (
                <div className="mt-1">
                  <span className="text-xs text-muted-foreground">
                    Payment Method: {transaction.paymentMethod}
                  </span>
                </div>
              )}
            </div>

            {/* Amount and Status */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="text-right">
                <div className="flex items-center space-x-1 font-semibold">
                  {getCurrencyIcon()}
                  <span>{transaction.amount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {transaction.currency.toUpperCase()}
                </div>
              </div>

              <Badge 
                className={`${getStatusColor(transaction.status)} border-0 font-medium`}
              >
                {getStatusText(transaction.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewCourse}
            className="hidden sm:inline-flex"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>

          {transaction.status === "success" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReceipt}
              disabled={isDownloading}
              className="text-primary hover:text-primary"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1" />
              )}
              Receipt
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Actions */}
      <div className="flex items-center space-x-2 mt-3 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewCourse}
          className="flex-1"
        >
          <Eye className="w-4 h-4 mr-1" />
          View Course
        </Button>

        {transaction.status === "success" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
            className="flex-1"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1" />
            )}
            Receipt
          </Button>
        )}
      </div>
    </div>
  );
};

export default TransactionCard;