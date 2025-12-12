import React from "react";
import { usePanoramaStats } from "graphql/hooks/usePanoramaStats";
import { Bookmark, Upload, BookmarkX } from "lucide-react";

export default function CardsDashBoard() {
  const { stats } = usePanoramaStats();

  const cards = [
    {
      title: "Total Uploaded",
      value: stats?.total ?? 0,
      color: "from-blue-500/10 to-blue-500/30",
      iconColor: "text-blue-600",
      Icon: Upload,
    },
    {
      title: "Total Bookmarked",
      value: stats?.bookmarked ?? 0,
      color: "from-green-500/10 to-green-500/30",
      iconColor: "text-green-600",
      Icon: Bookmark,
    },
    {
      title: "Total Unbookmarked",
      value: stats?.unbookmarked ?? 0,
      color: "from-purple-500/10 to-purple-500/30",
      iconColor: "text-purple-600",
      Icon: BookmarkX,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="
        p-5 bg-white rounded-xl shadow-sm
        hover:shadow-md transition-all duration-300
        flex justify-between items-center
      "
          data-testid={`dashboard-card-${card.title
            .toLowerCase()
            .replace(/ /g, "-")}`}
        >
          <div>
            <div className="text-gray-500 text-sm">{card.title}</div>
            <div className="text-2xl font-bold mt-1">{card.value}</div>
          </div>

          <div
            className={`
          p-3 rounded-xl shadow-sm flex items-center justify-center
          ${card.color} ${card.iconColor}
        `}
          >
            <card.Icon size={26} />
          </div>
        </div>
      ))}
    </div>
  );
}
