import React from "react";
import { Layout, Menu } from "antd";
import { DashboardOutlined, TableOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

export default function Sidebar({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();

  const items = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      navigate: "/",
    },
    {
      key: "2",
      icon: <TableOutlined />,
      label: "Panorama images",
      navigate: "/images",
    },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      breakpoint="md"
      collapsedWidth={64}
      className="bg-[#fff]"
    >
      <div
        className="flex items-center justify-start gap-2 text-[20px] text-center font-bold m-3 pl-3 w-full cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src="/logo.png" alt="Logo" className="w-8 h-8" />
        AirGo3D
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname === "/images" ? "2" : "1"]}
        onClick={({ key }) => {
          const item = items.find((i) => i.key === key);
          if (item?.navigate) navigate(item.navigate);
        }}
        items={items}
      />
    </Sider>
  );
}
