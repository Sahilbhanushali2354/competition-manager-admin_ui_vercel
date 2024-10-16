import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  MenuProps,
  Space,
  message,
  theme,
} from "antd";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import "../index.css";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../common/config/router/firebase.config";
import { useEffect } from "react";
const { Header, Content, Sider } = Layout;

const Mainlayout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const x = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });

    return () => x();
  }, [navigate]);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const path = useLocation().pathname;

  const items2: MenuProps["items"] = [
    {
      key: "/dashboard",
      label: <Link to="/dashboard">Home</Link>,
    },
    {
      key: "/participantregistration",
      label: <Link to="/participantregistration">Register Participant</Link>,
    },
    {
      key: "/allparticipants",
      label: <Link to="/allparticipants">All Participants</Link>,
    },
    {
      key: "/competition",
      label: <Link to="/competition">Competition</Link>,
    },
    {
      key: "/feedback",
      label: <Link to="/feedback">Feedback</Link>,
    },
  ];

  const signout = () => {
    signOut(auth)
      .then(() => {
        localStorage.clear();
        navigate("/login");
      })
      .catch((error) => {
        message.error(error);
      });
  };

  const items: MenuProps["items"] = [
    {
      key: "name",
      label: (
        <label style={{ color: "#69b1ff" }}>
          {localStorage.getItem("adminauth")}
        </label>
      ),
    },
    {
      key: "/login",
      label: (
        <Button
          onClick={() => {
            signout();
          }}
        >
          Log out
        </Button>
      ),
    },
  ];
  return (
    <Layout>
      <Header
        style={{
          padding: "0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link to="/dashboard" style={{ paddingLeft: "30px" }}>
          Protocol Zone
        </Link>

        <Dropdown menu={{ items }}>
          <Space direction="vertical" style={{ paddingRight: "7px" }} size={16}>
            <Space wrap size={16}>
              <Avatar size={48} icon={<UserOutlined />} />
            </Space>
          </Space>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode="inline"
            selectedKeys={[path]}
            defaultOpenKeys={["sub1"]}
            style={{ height: "100%", borderRight: 0 }}
            items={items2}
          />
        </Sider>
        <Layout style={{ padding: "0 24px 24px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[
              { title: <Link to="/">Home</Link> },
              { title: <Link to={{ path }}>{path.replace("/", "")}</Link> },
            ]}
          ></Breadcrumb>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <div
              key="asids"
              style={{
                overflowY: "auto",
                maxHeight: "calc(100vh - 64px - 48px)",
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Mainlayout;
