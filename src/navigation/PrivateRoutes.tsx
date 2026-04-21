import { Fragment } from "react";
import { matchPath, Navigate, Outlet, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { OnboardingModalWrapper } from "../components/onboarding/OnboardingModalWrapper";
import { useUserContext } from "../context/User.context";
import useAuth from "../hooks/useAuth";
import { allRoutes, PublicRoutes } from "./constants";

export function PrivateRoutes() {
  useAuth();
  const location = useLocation();
  const { user } = useUserContext();

  const currentRoute = allRoutes
    .filter((route) => route.path)
    .find((route) =>
      matchPath({ path: route.path ?? "", end: false }, location.pathname),
    );

  if (!user || !allRoutes || !currentRoute) return null;

  if (allRoutes?.find((route) => route.name === currentRoute?.name)) {
    return (
      <Fragment>
        <OnboardingModalWrapper />
        <Outlet />
      </Fragment>
    );
  } else {
    toast.error(
      `You don't have rights to see this page ${location.pathname}. Login with a user that has the required permissions.`,
    );

    return (
      <Navigate to={PublicRoutes.Login} state={{ from: location }} replace />
    );
  }
}
