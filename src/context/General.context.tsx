import type { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { createContext, useContext, useState } from "react";
import type { TabOption } from "../components/panelComponents/FormElements/TabInputScreen";
import type { ColumnType } from "../components/panelComponents/shared/types";
import { RowPerPageEnum } from "../types";
import { useUserContext } from "./User.context";

export type TabOrientation = "horizontal" | "vertical";

type FormElementsState = {
  [key: string]: any;
};

type GeneralContextType = {
  sortConfigKey: {
    key: string;
    direction: "ascending" | "descending";
  } | null;
  setSortConfigKey: (
    config: {
      key: string;
      direction: "ascending" | "descending";
    } | null,
  ) => void;
  constantActiveTab: number;
  setConstantActiveTab: (tab: number) => void;
  userPageActiveTab: number;
  setUserPageActiveTab: (tab: number) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (open: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
  expandedRows: Record<string, boolean>;
  setExpandedRows: Dispatch<SetStateAction<Record<string, boolean>>>;
  tableColumns: Record<string, ColumnType[]>;
  setTableColumns: Dispatch<SetStateAction<Record<string, ColumnType[]>>>;
  isSelectionActive: boolean;
  setIsSelectionActive: (isActive: boolean) => void;
  selectedRows: any[];
  setSelectedRows: (rows: any[]) => void;
  resetGeneralContext: () => void;
  isTabInputScreenOpen: boolean;
  setIsTabInputScreenOpen: (isOpen: boolean) => void;
  tabInputScreenOptions: TabOption[];
  setTabInputScreenOptions: (options: TabOption[]) => void;
  tabInputFormKey: string;
  setTabInputFormKey: (key: string) => void;
  tabInputInvalidateKeys: {
    key: string;
    defaultValue: any;
  }[];
  setTabInputInvalidateKeys: (
    keys: {
      key: string;
      defaultValue: any;
    }[],
  ) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isHoverExpanded: boolean;
  setIsHoverExpanded: (expanded: boolean) => void;
  tabOrientation: TabOrientation;
  setTabOrientation: (orientation: TabOrientation) => void;
  showTeacherFilter: boolean;
  setShowTeacherFilter: (show: boolean) => void;
  filterTeacherFormElements: FormElementsState;
  setFilterTeacherFormElements: (state: FormElementsState) => void;
};

const GeneralContext = createContext<GeneralContextType>({
  sortConfigKey: null,
  setSortConfigKey: () => {},
  constantActiveTab: 0,
  setConstantActiveTab: () => {},
  userPageActiveTab: 0,
  setUserPageActiveTab: () => {},
  isNotificationOpen: false,
  setIsNotificationOpen: () => {},
  isLogoutModalOpen: false,
  setIsLogoutModalOpen: () => {},
  currentPage: 1,
  setCurrentPage: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  rowsPerPage: RowPerPageEnum.THIRD,
  setRowsPerPage: () => {},
  expandedRows: {},
  setExpandedRows: () => {},
  tableColumns: {},
  setTableColumns: () => {},
  isSelectionActive: false,
  setIsSelectionActive: () => {},
  selectedRows: [],
  setSelectedRows: () => {},
  resetGeneralContext: () => {},
  isTabInputScreenOpen: false,
  setIsTabInputScreenOpen: () => {},
  tabInputScreenOptions: [],
  setTabInputScreenOptions: () => {},
  tabInputFormKey: "",
  setTabInputFormKey: () => {},
  tabInputInvalidateKeys: [],
  setTabInputInvalidateKeys: () => {},
  isSidebarOpen: true,
  setIsSidebarOpen: () => {},
  isHoverExpanded: false,
  setIsHoverExpanded: () => {},
  tabOrientation: "horizontal",
  setTabOrientation: () => {},
  showTeacherFilter: false,
  setShowTeacherFilter: () => {},
  filterTeacherFormElements: {
    school: 0,
  },
  setFilterTeacherFormElements: () => {},
});

export const GeneralContextProvider = ({ children }: PropsWithChildren) => {
  const { user } = useUserContext();
  const [sortConfigKey, setSortConfigKey] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [constantActiveTab, setConstantActiveTab] = useState<number>(0);
  const [filterTeacherFormElements, setFilterTeacherFormElements] =
    useState<FormElementsState>({
      school: "",
    });
  const [userPageActiveTab, setUserPageActiveTab] = useState<number>(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [rowsPerPage, setRowsPerPage] = useState<number>(RowPerPageEnum.THIRD);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [tableColumns, setTableColumns] = useState<
    Record<string, ColumnType[]>
  >({});
  const [isSelectionActive, setIsSelectionActive] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [isTabInputScreenOpen, setIsTabInputScreenOpen] =
    useState<boolean>(false);
  const [tabInputScreenOptions, setTabInputScreenOptions] = useState<
    TabOption[]
  >([]);
  const [tabInputFormKey, setTabInputFormKey] = useState<string>("");
  const [tabInputInvalidateKeys, setTabInputInvalidateKeys] = useState<
    { key: string; defaultValue: any }[]
  >([]);
  const [isSidebarOpen, setIsSidebarOpenState] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebar-open");
    return saved ? JSON.parse(saved) : true;
  });
  const [isHoverExpanded, setIsHoverExpanded] = useState<boolean>(false);
  const [tabOrientation, setTabOrientationState] = useState<TabOrientation>(
    () => {
      const saved = localStorage.getItem("tab-orientation");
      return (saved as TabOrientation) || "horizontal";
    },
  );
  const [showTeacherFilter, setShowTeacherFilter] = useState<boolean>(false);

  const setIsSidebarOpen = (open: boolean) => {
    localStorage.setItem("sidebar-open", JSON.stringify(open));
    setIsSidebarOpenState(open);
  };

  const setTabOrientation = (orientation: TabOrientation) => {
    localStorage.setItem("tab-orientation", orientation);
    setTabOrientationState(orientation);
  };

  const resetGeneralContext = () => {
    setIsSelectionActive(false);
    setSelectedRows([]);
    setSortConfigKey(null);
    setExpandedRows({});
    setSearchQuery("");
    setCurrentPage(1);
    setIsNotificationOpen(false);
    setIsTabInputScreenOpen(false);
    setTabInputScreenOptions([]);
    setTabInputFormKey("");
    setTabInputInvalidateKeys([]);
  };

  return (
    <GeneralContext.Provider
      value={{
        sortConfigKey,
        setSortConfigKey,
        constantActiveTab,
        setConstantActiveTab,
        userPageActiveTab,
        setUserPageActiveTab,
        isNotificationOpen,
        setIsNotificationOpen,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        currentPage,
        setCurrentPage,
        searchQuery,
        setSearchQuery,
        rowsPerPage,
        setRowsPerPage,
        expandedRows,
        setExpandedRows,
        tableColumns,
        setTableColumns,
        isSelectionActive,
        setIsSelectionActive,
        selectedRows,
        setSelectedRows,
        resetGeneralContext,
        isTabInputScreenOpen,
        setIsTabInputScreenOpen,
        tabInputScreenOptions,
        setTabInputScreenOptions,
        tabInputFormKey,
        setTabInputFormKey,
        tabInputInvalidateKeys,
        setTabInputInvalidateKeys,
        isSidebarOpen,
        setIsSidebarOpen,
        isHoverExpanded,
        setIsHoverExpanded,
        tabOrientation,
        setTabOrientation,
        showTeacherFilter,
        setShowTeacherFilter,
        filterTeacherFormElements,
        setFilterTeacherFormElements,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
};

export const useGeneralContext = () => useContext(GeneralContext);
