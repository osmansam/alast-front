import type { ComponentType } from "react";
import type { Tab } from "../components/panelComponents/shared/types";
import Admins from "../pages/Admins";
import Card from "../pages/Card";
import CardSets from "../pages/CardSets";
import Classes from "../pages/Classes";
import Constants from "../pages/Constants";
import Experiments from "../pages/Experiments";
import Schools from "../pages/Schools";
import Teachers from "../pages/Teachers";

export const PublicRoutes = {
  NotFound: "*",
  Login: "/login",
  CampaignForm: "/campaign/:eventSlug",
};

export const Routes = {
  Schools: "/schools",
  Classes: "/classes",
  Teachers: "/teachers",
  Admins: "/admins",
  Experiments: "/experiments",
  CardSets: "/card-sets",
  Constants: "/constants",
  Card: "/card/:cardSetId",
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
    name: "Schools",
    path: Routes.Schools,
    element: Schools,
    isOnSidebar: true,
  },
  {
    name: "Teachers",
    path: Routes.Teachers,
    element: Teachers,
    isOnSidebar: true,
  },
  {
    name: "Admins",
    path: Routes.Admins,
    element: Admins,
    isOnSidebar: true,
  },
  {
    name: "Classes",
    path: Routes.Classes,
    element: Classes,
    isOnSidebar: true,
  },
  {
    name: "Experiments",
    path: Routes.Experiments,
    element: Experiments,
    isOnSidebar: true,
  },
  {
    name: "Card Sets",
    path: Routes.CardSets,
    element: CardSets,
    isOnSidebar: true,
  },
  {
    name: "Constants",
    path: Routes.Constants,
    element: Constants,
    isOnSidebar: true,
  },
  {
    name: "Card",
    path: Routes.Card,
    element: Card,
    isOnSidebar: false,
  },
];

export const NO_IMAGE_URL =
  "https://res.cloudinary.com/dvbg/image/upload/ar_4:4,c_crop/c_fit,h_100/davinci/no-image_pyet1d.jpg";
