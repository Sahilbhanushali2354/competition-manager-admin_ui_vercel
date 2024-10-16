import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../common/config/router/firebase.config";
import { Avatar, Space, Spin, message } from "antd";
import { AiOutlineGoogle } from "react-icons/ai";
import { useEffect, useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const x = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });

    return () => x();
  }, [navigate]);
  const [loader, setLoader] = useState(false);

  const authentication = () => {
    setLoader(true);
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        localStorage.setItem("adminauth", user.email ?? "");
        navigate("/dashboard");
      })
      .catch((error) => {
        setLoader(false);
        const errorMessage = error.message;
        message.error(errorMessage);
      });
  };
  return (
    <Spin spinning={loader} style={{ height: "100%", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1>Sign in with Google</h1>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "40vh",
        }}
      >
        <Space
          direction="vertical"
          style={{
            paddingRight: "7px",
            cursor: "pointer",
            backgroundColor: "black",
            borderRadius: "50px",
          }}
          size={16}
          onClick={authentication}
        >
          <Space wrap size={16}>
            <Avatar size={64} icon={<AiOutlineGoogle />} />
          </Space>
        </Space>
      </div>
    </Spin>
  );
};

export default Login;
