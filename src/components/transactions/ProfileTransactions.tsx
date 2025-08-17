"use client";

import { useUserTransactions } from "@/hooks/usePayment";
import { ArrowRight, Receipt, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import TransactionCard from "./TransactionCard";

const ProfileTransactions = () => {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useUserTransactions({
    page: 1,
    limit: 5, // Show only recent 5 transactions in profile
  });

  const handleViewAll = () => {
    router.push("/profile/transactions");
  };

  const handleDownloadReceipt = (transactionId: string) => {
    window.open(`/api/v1/user/transactions/${transactionId}/receipt`, "_blank");
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Receipt className="w-5 h-5" />
            <span>Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              Failed to load transactions
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" />
              <span>Recent Transactions</span>
            </CardTitle>
            <CardDescription>
              Your latest course purchases and payments
            </CardDescription>
          </div>
          {!isLoading &&
            data?.data?.transactions &&
            data.data.transactions.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleViewAll}>
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="w-16 h-12 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : data?.data?.transactions?.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No transactions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start your learning journey by purchasing a course
            </p>
            <Button variant="outline" onClick={() => router.push("/courses")}>
              Browse Courses
            </Button>
          </div>
        ) : (
          <div className="divide-y">
            {data?.data?.transactions?.slice(0, 5).map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onDownloadReceipt={handleDownloadReceipt}
              />
            ))}

            {data?.data?.transactions && data.data.transactions.length > 5 && (
              <div className="p-4 text-center">
                <Button variant="ghost" size="sm" onClick={handleViewAll}>
                  View {data.data.pagination.totalCount - 5} more transactions
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileTransactions;
