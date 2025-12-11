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
    <Card title="Panorama Statistics" className="my-4">
      <Row gutter={16}>
        <Col span={12}>
          <h3 className="text-lg font-semibold text-gray-700">
            Bookmark Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
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
                label={renderLabel}
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
                verticalAlign="bottom"
                height={32}
                formatter={(value) => (
                  <span className="text-gray-700 font-medium">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col span={12}>
          <h3 className="text-lg font-semibold text-gray-700">Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barData}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="url(#colorUv)">
                <LabelList
                  dataKey="value"
                  position="top"
                  style={{ fill: "#333", fontSize: 14, fontWeight: 600 }}
                />
              </Bar>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Card>
  );
};

export default AnalyticsChart;
