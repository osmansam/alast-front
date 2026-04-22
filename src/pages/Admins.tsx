import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEdit } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { ConfirmationDialog } from "../common/ConfirmationDialog";
import { Header } from "../components/header/Header";
import GenericAddEditPanel from "../components/panelComponents/FormElements/GenericAddEditPanel";
import {
  FormKeyTypeEnum,
  InputTypes,
} from "../components/panelComponents/shared/types";
import GenericTable from "../components/panelComponents/Tables/GenericTable";
import { RoleEnum, User } from "../types";
import { UpdatePayload } from "../utils/api";
import { useGetAdmins, useUserMutations } from "../utils/api/user";

type AdminRow = Omit<User, "school"> & {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

const Admins = () => {
  const { t } = useTranslation();
  const { updateUser, createUser } = useUserMutations();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rowToAction, setRowToAction] = useState<AdminRow>();
  const [
    isCloseAllConfirmationDialogOpen,
    setIsCloseAllConfirmationDialogOpen,
  ] = useState(false);
  const admins = useGetAdmins();
  const rows = useMemo<AdminRow[]>(() => {
    return (admins ?? []).map((admin) => {
      return {
        ...admin,
        firstName: admin.first_name,
        lastName: admin.last_name,
        username: (admin as any)?.username ?? (admin as any)?.userName ?? "",
        email: (admin as any)?.email ?? "",
      };
    });
  }, [admins]);

  const columns = useMemo(
    () => [
      { key: t("LastName"), isSortable: true },
      { key: t("FirstName"), isSortable: true },
      { key: t("Username"), isSortable: true },
      { key: t("Email"), isSortable: true },
      { key: t("Actions"), isSortable: false },
    ],
    [t],
  );

  const rowKeys = useMemo(
    () => [
      { key: "lastName" },
      { key: "firstName" },
      { key: "username" },
      { key: "email" },
    ],
    [],
  );

  const inputs = useMemo(
    () => [
      {
        type: InputTypes.TEXT,
        formKey: "first_name",
        label: t("FirstName"),
        placeholder: t("FirstName"),
        required: false,
      },
      {
        type: InputTypes.TEXT,
        formKey: "last_name",
        label: t("LastName"),
        placeholder: t("LastName"),
        required: false,
      },
      {
        type: InputTypes.TEXT,
        formKey: "username",
        label: t("Username"),
        placeholder: t("Username"),
        required: false,
      },
      {
        type: InputTypes.EMAIL,
        formKey: "email",
        label: t("Email"),
        placeholder: t("Email"),
        required: false,
      },
      {
        type: InputTypes.PASSWORD,
        formKey: "password",
        label: t("Password"),
        placeholder: t("Password"),
        required: isAddModalOpen,
        isDisabled: !isAddModalOpen,
      },
    ],
    [t, isAddModalOpen],
  );

  const formKeys = useMemo(
    () => [
      { key: "first_name", type: FormKeyTypeEnum.STRING },
      { key: "last_name", type: FormKeyTypeEnum.STRING },
      { key: "username", type: FormKeyTypeEnum.STRING },
      { key: "email", type: FormKeyTypeEnum.STRING },
      { key: "password", type: FormKeyTypeEnum.STRING },
    ],
    [],
  );
  const addButton = useMemo(
    () => ({
      name: t("Add Admin"),
      isModal: true,
      modal: (
        <GenericAddEditPanel
          isOpen={isAddModalOpen}
          close={() => setIsAddModalOpen(false)}
          inputs={inputs}
          formKeys={formKeys}
          submitItem={
            createUser as unknown as (
              item: Partial<User> | UpdatePayload<Partial<User>>,
            ) => void
          }
          constantValues={{
            role: RoleEnum.ADMIN,
            isDeleted: false,
          }}
          topClassName="flex flex-col gap-2"
        />
      ),
      isModalOpen: isAddModalOpen,
      setIsModal: setIsAddModalOpen,
      isPath: false,
      className: "bg-blue-500 hover:text-blue-500 hover:border-blue-500",
    }),
    [t, isAddModalOpen, inputs, formKeys, createUser],
  );
  const actions = useMemo(
    () => [
      {
        name: t("Edit"),
        icon: <FiEdit />,
        className: "text-blue-500 cursor-pointer text-xl",
        isModal: true,
        setRow: setRowToAction,
        modal: rowToAction ? (
          <GenericAddEditPanel
            isOpen={isEditModalOpen}
            close={() => setIsEditModalOpen(false)}
            inputs={inputs}
            formKeys={formKeys}
            submitItem={updateUser as any}
            isEditMode={true}
            topClassName="flex flex-col gap-2"
            itemToEdit={{
              id: rowToAction._id,
              updates: rowToAction,
            }}
          />
        ) : null,
        isModalOpen: isEditModalOpen,
        setIsModal: setIsEditModalOpen,
        isPath: false,
      },
      {
        name: t("Delete"),
        icon: <HiOutlineTrash />,
        setRow: setRowToAction,
        modal: rowToAction ? (
          <ConfirmationDialog
            isOpen={isCloseAllConfirmationDialogOpen}
            close={() => setIsCloseAllConfirmationDialogOpen(false)}
            confirm={() => {
              updateUser({
                id: rowToAction._id,
                updates: {
                  isDeleted: true,
                },
              } as any);
              setIsCloseAllConfirmationDialogOpen(false);
            }}
            title={t("Delete Admin")}
            text={`${rowToAction.firstName} ${rowToAction.lastName} ${t("GeneralDeleteMessage")}`}
          />
        ) : null,
        className: "text-red-500 cursor-pointer text-2xl",
        isModal: true,
        isModalOpen: isCloseAllConfirmationDialogOpen,
        setIsModal: setIsCloseAllConfirmationDialogOpen,
        isPath: false,
      },
    ],
    [
      t,
      rowToAction,
      isEditModalOpen,
      inputs,
      formKeys,
      updateUser,
      isCloseAllConfirmationDialogOpen,
    ],
  );

  return (
    <>
      <Header showLocationSelector={false} />
      <div className="w-[95%] mx-auto my-10 flex flex-col gap-4">
        <GenericTable
          rowKeys={rowKeys}
          columns={columns}
          rows={rows}
          addButton={addButton}
          title={t("Admins")}
          actions={actions}
          isActionsActive={true}
        />
      </div>
    </>
  );
};

export default Admins;
