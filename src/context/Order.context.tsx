import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

type OrderContextValue = {
  filterSummaryFormElements: {
    after: string;
    before: string;
    location: string | number;
  };
};

const defaultValue: OrderContextValue = {
  filterSummaryFormElements: {
    after: "",
    before: "",
    location: "",
  },
};

const OrderContext = createContext<OrderContextValue>(defaultValue);

export const OrderContextProvider = ({ children }: PropsWithChildren) => {
  return (
    <OrderContext.Provider value={defaultValue}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderContext = () => useContext(OrderContext);
