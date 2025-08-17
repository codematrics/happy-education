"use client";

import { BarChart3, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";

interface MonthlyRevenue {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  transactions: number;
}

interface RevenueChartsProps {
  monthlyRevenue: MonthlyRevenue[];
}

const RevenueCharts = ({ monthlyRevenue }: RevenueChartsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxRevenue = Math.max(...monthlyRevenue.map(item => item.revenue), 1);
  const maxTransactions = Math.max(...monthlyRevenue.map(item => item.transactions), 1);

  // Calculate growth rate
  const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const previousMonth = monthlyRevenue[monthlyRevenue.length - 2];
  const growthRate = previousMonth?.revenue > 0 
    ? ((currentMonth?.revenue - previousMonth?.revenue) / previousMonth?.revenue * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Revenue Trends</span>
            </CardTitle>
            <CardDescription>
              Monthly revenue and transaction count over the last 12 months
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-sm">
              <TrendingUp className={`w-4 h-4 ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Revenue Chart */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Monthly Revenue</span>
            </h4>
            <div className="space-y-2">
              {monthlyRevenue.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 text-xs text-muted-foreground text-right">
                    {item.monthName}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-6 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.revenue / maxRevenue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-xs text-right font-medium">
                    {formatCurrency(item.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Chart */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Monthly Transactions</span>
            </h4>
            <div className="space-y-2">
              {monthlyRevenue.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 text-xs text-muted-foreground text-right">
                    {item.monthName}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.transactions / maxTransactions) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-xs text-right font-medium">
                    {item.transactions}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {monthlyRevenue.length > 0 && (
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Revenue (12M)</p>
                  <p className="font-semibold">
                    {formatCurrency(monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Transactions (12M)</p>
                  <p className="font-semibold">
                    {monthlyRevenue.reduce((sum, item) => sum + item.transactions, 0)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueCharts;