"use client";

import { useDownloadReceipt, useUserTransactions } from "@/hooks/usePayment";
import {
  Calendar,
  FileText,
  Filter,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import LoadingError from "../common/LoadingError";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import TransactionCard from "./TransactionCard";

const TransactionHistory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed" | "pending">("all");
  const [pageSize] = useState(10);

  const { data, isLoading, error, refetch } = useUserTransactions({
    page: currentPage,
    limit: pageSize,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const downloadReceipt = useDownloadReceipt();

  const handleDownloadReceipt = (transactionId: string) => {
    downloadReceipt.mutate(transactionId);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status as "all" | "success" | "failed" | "pending");
    setCurrentPage(1); // Reset to first page when filtering
  };


  const getSuccessfulTransactionsCount = () => {
    return data?.data?.transactions?.filter(t => t.status === "success").length || 0;
  };

  const getTotalSpent = () => {
    const successfulTransactions = data?.data?.transactions?.filter(t => t.status === "success") || [];
    return successfulTransactions.reduce((total, transaction) => {
      return total + transaction.amount;
    }, 0);
  };

  const getDisplayCurrency = () => {
    const firstTransaction = data?.data?.transactions?.[0];
    return firstTransaction?.currency === "dollar" ? "$" : "₹";
  };

  if (error) {
    return (
      <LoadingError
        isLoading={false}
        error={error.message}
        errorTitle="Failed to load transactions"
        onRetry={refetch}
        skeleton={<div>Loading...</div>}
      >
        <div>Error loading transactions</div>
      </LoadingError>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">
            View and manage your course purchases
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{data?.data?.pagination?.totalCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Successful Purchases</p>
                  <p className="text-2xl font-bold">{getSuccessfulTransactionsCount()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    {getDisplayCurrency()}{getTotalSpent().toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">All Transactions</CardTitle>
              <CardDescription>
                Filter and view your transaction history
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[...Array(5)].map((_, i) => (
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
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground mb-4">
                {statusFilter === "all" 
                  ? "You haven't made any course purchases yet." 
                  : `No ${statusFilter} transactions found.`}
              </p>
              <Button variant="outline" onClick={() => window.location.href = "/courses"}>
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {data?.data?.transactions?.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onDownloadReceipt={handleDownloadReceipt}
                  isDownloading={downloadReceipt.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.data?.pagination && data.data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!data.data.pagination.hasPreviousPage}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: data.data.pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const current = data.data.pagination.currentPage;
                return page === 1 || page === data.data.pagination.totalPages || 
                       (page >= current - 1 && page <= current + 1);
              })
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={page === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                </div>
              ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!data.data.pagination.hasNextPage}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;