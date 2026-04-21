import { useGeneralContext } from "../context/General.context";

export const resetGeneralContext = () => {
  const { setCurrentPage, setSearchQuery } = useGeneralContext();
  setCurrentPage(1);
  setSearchQuery("");
};
