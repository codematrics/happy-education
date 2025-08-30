"use client";

import { Activity, CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  successRate: string;
}

interface RevenueStatsProps {
  statistics?: RevenueStats;
}

const RevenueStatsComponent = ({ statistics }: RevenueStatsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const stats = [
    {
      title: "कुल राजस्व",
      value: formatCurrency(statistics?.totalRevenue || 0),
      description: "संपूर्ण समय का राजस्व",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "मासिक राजस्व",
      value: formatCurrency(statistics?.monthlyRevenue || 0),
      description: "वर्तमान माह",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "कुल लेनदेन",
      value: formatNumber(statistics?.totalTransactions || 0),
      description: "सभी लेनदेन",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "सफलता दर",
      value: `${statistics?.successRate || "0.00"}%`,
      description: `${formatNumber(
        statistics?.successfulTransactions || 0
      )} सफल`,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RevenueStatsComponent;
