import type { ComponentType } from "react";
import type { Tab } from "../components/panelComponents/shared/types";
import Comparision from "../pages/Comparision";

export const PublicRoutes = {
  NotFound: "*",
  Login: "/login",
  CampaignForm: "/campaign/:eventSlug",
};

export const Routes = {
  Comparision: "/comparision",
};

type AppRoute = {
  name: string;
  path?: string;
  isOnSidebar: boolean;
  exceptionalRoles?: number[];
  link?: string;
  element?: ComponentType<any>;
  tabs?: Tab[] | unknown[];
  children?: AppRoute[];
};

export const allRoutes: AppRoute[] = [
  {
    name: "Comparision",
    path: Routes.Comparision,
    element: Comparision,
    isOnSidebar: true,
  },
];

export const NO_IMAGE_URL =
  "https://res.cloudinary.com/dvbg/image/upload/ar_4:4,c_crop/c_fit,h_100/davinci/no-image_pyet1d.jpg";
