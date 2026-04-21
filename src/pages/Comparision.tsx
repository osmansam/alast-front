import { useState } from "react";
import { MdOutlinePriceChange } from "react-icons/md";
import { Header } from "../components/header/Header";
import UnifiedTabPanel from "../components/panelComponents/TabPanel/UnifiedTabPanel";
import GlobalPriceComparision from "../components/stocks/GlobalPriceComparision";
import { useGeneralContext } from "../context/General.context";

const ComparisionPageTabs = [
  {
    number: 1,
    label: "Global Price Comparision",
    icon: <MdOutlinePriceChange className="text-lg font-thin" />,
    content: <GlobalPriceComparision />,
    isDisabled: false,
  },
];

export default function Comparision() {
  const { setCurrentPage, setSearchQuery } = useGeneralContext();
  const [comparisionActiveTab, setComparisionActiveTab] = useState<number>(0);

  return (
    <>
      <Header />
      <div className="flex flex-col gap-2 mt-5 ">
        <UnifiedTabPanel
          tabs={ComparisionPageTabs}
          activeTab={comparisionActiveTab}
          setActiveTab={setComparisionActiveTab}
          additionalOpenAction={() => {
            setCurrentPage(1);
            setSearchQuery("");
          }}
          allowOrientationToggle={true}
        />
      </div>
    </>
  );
}
