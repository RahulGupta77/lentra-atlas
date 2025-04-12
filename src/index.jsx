import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import ProtectComponent from "./components/ProtectComponent";
import Login from "./pages/auth/Login.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import DataVerification from "./pages/data_verification/DataVerification.jsx";
import store from "./redux/store.js";

const ProtectedDashboard = ProtectComponent(Dashboard);
const ProtectedDataVerification = ProtectComponent(DataVerification);

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "/dashboard",
        element: <ProtectedDashboard />,
      },
      {
        path: "/dashboard/:id",
        element: <ProtectedDataVerification />,
      },
    ],
    errorElement: <div>Error Page</div>,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={store}>
    <RouterProvider router={appRouter} />
  </Provider>
);
