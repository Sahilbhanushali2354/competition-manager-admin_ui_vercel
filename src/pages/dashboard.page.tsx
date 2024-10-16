import { useState, useEffect } from "react";

const Dashboard = () => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const originalText = "Welcome Admin";
    let index = 0;
    const interval = setInterval(() => {
      if (index <= originalText.length) {
        setDisplayedText(originalText.substring(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <span style={{ color: "rgb(105, 177, 255)", fontSize: "30px" }}>
        {displayedText}
      </span>
    </div>
  );
};

export default Dashboard;
