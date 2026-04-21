import { useUserContext } from "../context/User.context";
import { allRoutes } from "../navigation/constants";
import type { Role } from "../types";

type PanelPage = {
  name: string;
  permissionRoles?: Array<string | number>;
};

export const useFilteredRoutes = () => {
  const { user } = useUserContext();
  const pages: PanelPage[] = [];

  if (!user) {
    return [];
  }

  // Fallback for environments where panel page permissions are not loaded yet.
  if (!pages || pages.length === 0) {
    return allRoutes || [];
  }

  const routes = allRoutes?.filter((route) => {
    if (!route.children) {
      return (
        route?.exceptionalRoles?.includes((user?.role as Role)._id) ||
        pages?.some(
          (page: PanelPage) =>
            page.name === route.name &&
            page.permissionRoles?.includes((user?.role as Role)._id),
        )
      );
    } else {
      return route.children.some(
        (child) =>
          child?.exceptionalRoles?.includes((user?.role as Role)._id) ||
          pages?.some(
            (page: PanelPage) =>
              page.name === child.name &&
              page.permissionRoles?.includes((user?.role as Role)._id),
          ),
      );
    }
  });

  return routes || [];
};
