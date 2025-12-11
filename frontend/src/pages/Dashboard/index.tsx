import AnalyticsChart from "components/AnalyticsChart";
import CardsDashBoard from "components/CardsDashBoard";
import React from "react";
export default function Dashboard() {
  return (
    <div>
      <CardsDashBoard />
      <AnalyticsChart />
    </div>
  );
}
