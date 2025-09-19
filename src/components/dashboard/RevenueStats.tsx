import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

interface RevenueStatsProps {
  address: string;
}

export const RevenueStats : React.FC<RevenueStatsProps> = ({ address }) => {
  const [stats, setStats] = useState({
    lifetimeRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0
  });
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    console.log(address);
    async function fetchStats(address: string) {
      try {
        const response = await fetch(`${apiUrl}/dashboard/getStats?seller=${address}`);
        const data = await response.json();
        setStats({
          lifetimeRevenue: data.lifetimeRevenue,
          weeklyRevenue: data.revenueWeekAgo,
          dailyRevenue: data.revenueDayAgo,
        });
      } catch (error) {
        console.error("Error fetching revenue stats:", error);
      }
    }

    fetchStats(address);
  }, [address]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Revenue Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Last 7 Days</p>
            <p className="text-2xl font-bold">{stats.weeklyRevenue} FLOW</p>
          </div>
          
          <div className="text-center border-x border-border">
            <p className="text-sm text-muted-foreground mb-2">Lifetime</p>
            <p className="text-2xl font-bold">{stats.lifetimeRevenue} FLOW</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Last 24 Hours</p>
            <p className="text-2xl font-bold">{stats.dailyRevenue} FLOW</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};