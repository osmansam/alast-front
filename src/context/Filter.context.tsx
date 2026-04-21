import { createContext, useContext, useState } from "react";

export type FilterPanelFormElements = Record<string, unknown> & {
  after?: string;
  before?: string;
};

export type FilterContextValue = {
  filterStockPanelFormElements: FilterPanelFormElements;
  setFilterStockPanelFormElements: (state: FilterPanelFormElements) => void;
};

export const filterContextDefaultValue: FilterContextValue = {
  filterStockPanelFormElements: {
    after: "",
    before: "",
  },
  setFilterStockPanelFormElements: () => {},
};

export const FilterContext = createContext<FilterContextValue>(
  filterContextDefaultValue,
);

export const FilterContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [filterStockPanelFormElements, setFilterStockPanelFormElements] =
    useState<FilterPanelFormElements>(
      filterContextDefaultValue.filterStockPanelFormElements,
    );

  return (
    <FilterContext.Provider
      value={{
        filterStockPanelFormElements,
        setFilterStockPanelFormElements,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilterContext = () => useContext(FilterContext);
