import React from "react";
import AuthenticationLayout from "../layouts/AuthenticationLayout";
import ForgetPassword from "../pages/auth/ForgetPassword";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import GuardRoute from "./GuardRoute";

// Xem cấu trúc routes ở https://reactrouter.com/en/main/routers/create-browser-router#routes
export default function init(routes) {
  const route = {
    path: "/",

    element: <AuthenticationLayout />,
    // Element là AuthenLayout, các children muốn hiển thị được trong AuthenLayout thì trong Layout phải có outlet mới hiển thị được
    // outlet đóng vai trò tương tự children
    // Xem thêm ở https://reactrouter.com/en/main/components/outlet
    children: [
      {
        path: "/login",
        element: (
          <GuardRoute path="/login">
            <LoginPage />
          </GuardRoute>
        ),
      },
      {
        path: "/signup",
        element: (
          <GuardRoute path="/signup">
            <SignupPage />
          </GuardRoute>
        ),
      },
      {
        path: "/forgotpassword",
        element: (
          <GuardRoute path="/forgotpassword">
            <ForgetPassword />
          </GuardRoute>
        ),
      },
    ],
  };
  // push route
  routes.push(route);
}
