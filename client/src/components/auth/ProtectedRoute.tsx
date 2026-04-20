import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useStore from "../../store/useStore";

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const user = useStore((state) => state.user);

  if (!user) {
    return (
      <Navigate to="/signin" replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
