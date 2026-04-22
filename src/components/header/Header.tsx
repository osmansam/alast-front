import { Link } from "react-router-dom";
import { Routes } from "../../navigation/constants";
import logo from "./logo.svg";

export interface HeaderDateProps {
  date: Date;
  setDate: (date: string) => void;
}

interface HeaderProps {
  showLocationSelector?: boolean;
  allowedLocations?: number[];
  dateProps?: HeaderDateProps;
}

export function Header({ dateProps }: HeaderProps) {
  const handleScrollToTop = () => {
    if (location.pathname === Routes.Comparision) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="sticky top-0 z-50">
      <nav className="w-full bg-gray-800 shadow">
        <div
          className={`${
            dateProps ? "h-12 sm:h-16" : "h-16"
          } flex justify-between pl-2 lg:pl-4 pr-2 lg:pr-6 mr-2 lg:mr-20`}
        >
          <div className="flex flex-row gap-2 items-center">
            <Link to={Routes.Comparision} onClick={handleScrollToTop}>
              <img
                src={logo}
                alt="profile"
                className="w-10 h-10 rounded-full"
              />
            </Link>
            <Link to={Routes.Comparision} className="hidden sm:block">
              <span className="text-base text-white font-bold tracking-normal leading-tight">
                ALAST Panel
              </span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
