import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FilterContextProvider } from "./context/Filter.context";
import {
  GeneralContextProvider,
  useGeneralContext,
} from "./context/General.context";

import { LogoutConfirmationModal } from "./common/LogoutConfirmationModal";
import { Sidebar } from "./common/Sidebar";
import { UserContextProvider, useUserContext } from "./context/User.context";
import RouterContainer from "./navigation/routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ChangePasswordModal() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(
    () => localStorage.getItem("mustChangePassword") === "true",
  );

  if (!visible) return null;

  const handleClose = () => {
    localStorage.removeItem("mustChangePassword");
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 z-[99999] p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center gap-5 w-full max-w-sm text-center">
        <p className="text-blue-800 font-semibold text-lg">
          {t("You must change your password")}
        </p>
        <p className="text-gray-600 text-sm">
          {t("Please go to the following address to change your password.")}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
            onClick={handleClose}
          >
            {t("Later")}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isSidebarOpen, isHoverExpanded } = useGeneralContext();
  const { user } = useUserContext();
  const isExpanded = isSidebarOpen || isHoverExpanded;

  return (
    <div className="App">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          user ? (isExpanded ? "lg:ml-64" : "lg:ml-16") : ""
        }`}
      >
        <RouterContainer />
      </div>
      <LogoutConfirmationModal />
      {user && <ChangePasswordModal />}
      <ToastContainer
        autoClose={2000}
        hideProgressBar={true}
        transition={Slide}
        closeButton={false}
        position="bottom-right"
        style={{ zIndex: 999999 }}
      />
    </div>
  );
}

function AppWrapper() {
  const { user } = useUserContext();

  // Only load data when user is authenticated
  if (!user) {
    return <App />;
  }

  return (
    <FilterContextProvider>
      <App />
    </FilterContextProvider>
  );
}

function ContextWrapper() {
  const { user } = useUserContext();

  // Only load location context when user is authenticated
  if (!user) {
    return <AppWrapper />;
  }

  return <AppWrapper />;
}

function Wrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserContextProvider>
        <GeneralContextProvider>
          <ContextWrapper />
        </GeneralContextProvider>
      </UserContextProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default Wrapper;
