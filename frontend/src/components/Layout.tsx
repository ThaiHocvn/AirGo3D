import { Layout as AntLayout, Grid } from "antd";
import * as React from "react";
import Sidebar from "./ui/Sidebar";

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const screens = Grid.useBreakpoint();
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    if (!screens.md) setCollapsed(true);
    else setCollapsed(false);
  }, [screens.md]);

  return (
    <AntLayout className="min-h-screen">
      <Sidebar collapsed={collapsed} />
      <AntLayout>
        <Header className="bg-white"></Header>
        <Content className="p-6 bg-gray-100">{children}</Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
