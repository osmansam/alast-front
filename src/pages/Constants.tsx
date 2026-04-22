import { GrActions } from "react-icons/gr";

import { Header } from "../components/header/Header";
import UnifiedTabPanel from "../components/panelComponents/TabPanel/UnifiedTabPanel";
import Role from "../components/role/Role";
import { useGeneralContext } from "../context/General.context";
import { useUserContext } from "../context/User.context";
import { ConstantPageTabsEnum } from "../types";

export const ConstantPageTabs = [
  {
    number: ConstantPageTabsEnum.ROLES,
    label: "Roles",
    icon: <GrActions className="text-lg font-thin" />,
    content: <Role />,
    isDisabled: false,
  },
];
export default function Constant() {
  const { constantActiveTab, setConstantActiveTab } = useGeneralContext();
  const { user } = useUserContext();
  if (!user) return <></>;

  return (
    <>
      <Header showLocationSelector={false} />
      <UnifiedTabPanel
        tabs={ConstantPageTabs}
        activeTab={constantActiveTab}
        setActiveTab={setConstantActiveTab}
        allowOrientationToggle={true}
      />
    </>
  );
}
