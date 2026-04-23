import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./pages/Home";
import Flights from "./pages/Flights";
import Booking from "./pages/Booking";
import Auth from "./pages/Auth";
import ChatBot from "./pages/ChatBot";
import PriceAlerts from "./pages/PriceAlerts";
import Itinerary from "./pages/Itinerary";
import CarbonTracker from "./pages/CarbonTracker";
import GroupBooking from "./pages/GroupBooking";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "flights", Component: Flights },
      { path: "booking", Component: Booking },
      { path: "auth", Component: Auth },
      { path: "profile", Component: Profile },
      { path: "chatbot", Component: ChatBot },
      { path: "price-alerts", Component: PriceAlerts },
      { path: "itinerary", Component: Itinerary },
      { path: "carbon-tracker", Component: CarbonTracker },
      { path: "group-booking", Component: GroupBooking },
    ],
  },
]);
