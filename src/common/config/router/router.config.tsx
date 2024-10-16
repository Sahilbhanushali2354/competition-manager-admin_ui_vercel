import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../../../pages/dashboard.page";
import Login from "../../../pages/login.page";
import Mainlayout from "../../../layouts/main.layout";
import Splash from "../../../pages/splash.page";
import Competitionlayout from "../../../layouts/competition.layout";
import Competition from "../../../pages/competition.page";
import CompetitionTabs from "../../../pages/competitionTabs.page";
import People from "../../../pages/peopleRegistration.page";
import AllPeople from "../../../pages/allpeople.page";
import Feedback from "../../../pages/feedback.form";

export const Router = createBrowserRouter([
  {
    element: <Mainlayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/participantregistration",
        element: <People />,
      },
      {
        path: "/allparticipants",
        element: <AllPeople />,
      },
      {
        path: "/feedback",
        element: <Feedback />,
      },
      {
        element: <Competitionlayout />,
        children: [
          {
            path: "/competition",
            element: <Competition />,
          },
          {
            path: "/competition/:id",
            element: <CompetitionTabs />,
          },
        ],
      },
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Splash />,
  },
]);
