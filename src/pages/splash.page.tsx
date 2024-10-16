import { Spin } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Splash = () => {
  const navigate = useNavigate();
 useEffect(() => {
  setTimeout(() => {
    navigate("/dashboard");
  }, 2000);

 }, [])
  return <Spin fullscreen></Spin>;
};

export default Splash;
