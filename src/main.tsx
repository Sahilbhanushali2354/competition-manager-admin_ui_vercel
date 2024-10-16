import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "../node_modules/react-router-dom/dist/index";
import { Router } from "./common/config/router/router.config";
import { RecoilRoot } from "recoil";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
  <RecoilRoot>
    <RouterProvider router={Router}></RouterProvider>
  </RecoilRoot>
   </React.StrictMode>
);
