import TransactionHistory from "@/components/transactions/TransactionHistory";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transaction History - Happy Education",
  description: "View your course purchase history and download receipts",
};

const TransactionsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <TransactionHistory />
    </div>
  );
};

export default TransactionsPage;