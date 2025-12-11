import { ApolloProvider } from "@apollo/client";
import { ConfigProvider } from "antd";
import Dashboard from "pages/Dashboard";
import PanoramaTable from "pages/PanoramaTable";
import React from "react";
import { Provider } from "react-redux";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import apolloClient from "./config/apollo";
import { store } from "./store/store";

const App: React.FC = () => {
  return (
    <ApolloProvider client={apolloClient}>
      <Provider store={store}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#1890ff",
            },
          }}
        >
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/images" element={<PanoramaTable />} />
              </Routes>
            </Layout>
          </Router>
        </ConfigProvider>
      </Provider>
    </ApolloProvider>
  );
};

export default App;
