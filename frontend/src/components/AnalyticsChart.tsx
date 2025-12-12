import * as React from "react";
import { Card, Row, Col } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { usePanoramaStats } from "graphql/hooks/usePanoramaStats";
import { useBreakpoint } from "hooks/useBreakpoint";

type PieLabelProps = {
  name: string;
  value: number;
  percent: number;
  x: number;
  y: number;
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  innerRadius: number;
  index: number;
};

const COLORS = ["#16A34A", "#7C3AED", "#2563EB"];

const AnalyticsChart = () => {
  const { isMobile, isSmallMobile } = useBreakpoint();
  const { stats } = usePanoramaStats();

  const pieData = [
    { name: "Bookmarked", value: stats?.bookmarked ?? 0 },
    { name: "UnBookmarked", value: stats?.unbookmarked ?? 0 },
  ];

  const barData = [
    { name: "Total", value: stats?.total ?? 0 },
    { name: "Bookmarked", value: stats?.bookmarked ?? 0 },
    { name: "UnBookmarked", value: stats?.unbookmarked ?? 0 },
  ];

  const renderLabel = ({
    name,
    percent,
    cx,
    cy,
    midAngle,
    outerRadius,
  }: any) => {
    const RADIAN = Math.PI / 180;

    const radius = outerRadius + 30;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#4b5563"
        fontSize={14}
        fontWeight={500}
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${name}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card
      title="Panorama Statistics"
      className="my-4 shadow-sm rounded-xl"
      styles={{
        body: { padding: isMobile ? "10px" : "16px" },
      }}
      data-testid="chart-card"
    >
      <Row gutter={16}>
        <Col xs={24} sm={24} md={12}>
          <h3 className="text-lg font-semibold text-gray-700 ml-2">
            Bookmark Distribution
          </h3>
          <div className="w-full h-[260px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ left: 40, right: 40, top: 20, bottom: 20 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                  label={!isMobile ? renderLabel : undefined}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    padding: "6px 10px",
                    border: "1px solid #e5e7eb",
                  }}
                />

                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    whiteSpace: "nowrap",
                  }}
                  formatter={(value) => (
                    <span className="text-gray-700 font-medium">{value}</span>
                  )}
                />

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <h3 className="text-lg font-semibold text-gray-700">Overview</h3>
          <div className="w-full min-w-[320px] h-[240px] md:ml-0 ml-[-50px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                barCategoryGap="15%"
                barGap={8}
              >
                <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />

                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  fill="url(#gradient)"
                >
                  <LabelList
                    dataKey="value"
                    position="top"
                    style={{
                      fill: "#111",
                      fontSize: isMobile ? 10 : 13,
                      fontWeight: 600,
                    }}
                  />
                </Bar>

                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default AnalyticsChart;
