import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CiCirclePlus } from "react-icons/ci";
import { FiEdit } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { ConfirmationDialog } from "../common/ConfirmationDialog";
import { Header } from "../components/header/Header";
import GenericAddEditPanel from "../components/panelComponents/FormElements/GenericAddEditPanel";
import GenericTable from "../components/panelComponents/Tables/GenericTable";
import {
  FormKeyTypeEnum,
  InputTypes,
} from "../components/panelComponents/shared/types";
import { useUserContext } from "../context/User.context";
import { RoleEnum, School } from "../types";
import { UpdatePayload } from "../utils/api";
import { useGetSchools, useSchoolMutations } from "../utils/api/school";
import { useUserMutations } from "../utils/api/user";
const Schools = () => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const schools = useGetSchools();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRegisterTeacherModalOpen, setIsRegisterTeacherModalOpen] =
    useState(false);
  const { createUser } = useUserMutations();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rowToAction, setRowToAction] = useState<School>();
  const [
    isCloseAllConfirmationDialogOpen,
    setIsCloseAllConfirmationDialogOpen,
  ] = useState(false);
  const { createSchool, updateSchool, deleteSchool } = useSchoolMutations();
  const rows = useMemo(() => {
    return schools ?? [];
  }, [schools]);

  const columns = useMemo(
    () => [
      { key: t("Name"), isSortable: true },
      { key: t("Actions"), isSortable: false },
    ],
    [t],
  );

  const rowKeys = useMemo(() => [{ key: "name" }], []);

  const inputs = useMemo(
    () => [
      {
        type: InputTypes.TEXT,
        formKey: "_id",
        label: t("ID"),
        placeholder: t("ID"),
        required: isAddModalOpen,
        isReadOnly: isEditModalOpen,
      },
      {
        type: InputTypes.TEXT,
        formKey: "name",
        label: t("Name"),
        placeholder: t("Name"),
        required: true,
      },
    ],
    [t, isAddModalOpen, isEditModalOpen],
  );

  const formKeys = useMemo(
    () => [
      { key: "_id", type: FormKeyTypeEnum.STRING },
      { key: "name", type: FormKeyTypeEnum.STRING },
    ],
    [],
  );

  const addButton = useMemo(
    () => ({
      name: t("Add School"),
      isModal: true,
      modal: (
        <GenericAddEditPanel
          isOpen={isAddModalOpen}
          close={() => setIsAddModalOpen(false)}
          inputs={inputs}
          formKeys={formKeys}
          submitItem={
            createSchool as unknown as (
              item: Partial<School> | UpdatePayload<Partial<School>>,
            ) => void
          }
          topClassName="flex flex-col gap-2"
        />
      ),
      isModalOpen: isAddModalOpen,
      setIsModal: setIsAddModalOpen,
      isPath: false,
      className: "bg-blue-500 hover:text-blue-500 hover:border-blue-500",
    }),
    [t, isAddModalOpen, inputs, formKeys, createSchool, user],
  );
  const addTeacherInputs = useMemo(
    () => [
      {
        type: InputTypes.TEXT,
        formKey: "first_name",
        label: t("FirstName"),
        placeholder: t("FirstName"),
        required: true,
      },
      {
        type: InputTypes.TEXT,
        formKey: "last_name",
        label: t("LastName"),
        placeholder: t("LastName"),
        required: true,
      },
      {
        type: InputTypes.TEXT,
        formKey: "username",
        label: t("Username"),
        placeholder: t("Username"),
        required: true,
      },
      {
        type: InputTypes.EMAIL,
        formKey: "email",
        label: t("Email"),
        placeholder: t("Email"),
        required: true,
      },
      {
        type: InputTypes.PASSWORD,
        formKey: "password",
        label: t("Password"),
        placeholder: t("Password"),
        required: true,
      },
    ],
    [t, isAddModalOpen, isEditModalOpen],
  );
  const addTeacherFormKeys = useMemo(
    () => [
      { key: "first_name", type: FormKeyTypeEnum.STRING },
      { key: "last_name", type: FormKeyTypeEnum.STRING },
      { key: "username", type: FormKeyTypeEnum.STRING },
      { key: "email", type: FormKeyTypeEnum.STRING },
      { key: "password", type: FormKeyTypeEnum.STRING },
    ],
    [],
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
            submitItem={
              updateSchool as unknown as (
                item: School | UpdatePayload<School>,
              ) => void
            }
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
              deleteSchool(rowToAction?._id);
              setIsCloseAllConfirmationDialogOpen(false);
            }}
            title={t("Delete School")}
            text={`${rowToAction.name} ${t("GeneralDeleteMessage")}`}
          />
        ) : null,
        className: "text-red-500 cursor-pointer text-2xl  ",
        isModal: true,
        isModalOpen: isCloseAllConfirmationDialogOpen,
        setIsModal: setIsCloseAllConfirmationDialogOpen,
        isPath: false,
      },
      {
        name: t("Register Teacher"),
        icon: <CiCirclePlus />,
        className: "text-2xl mt-1 cursor-pointer",
        isModal: true,
        setRow: setRowToAction,
        modal: (
          <GenericAddEditPanel
            isOpen={isRegisterTeacherModalOpen}
            close={() => setIsRegisterTeacherModalOpen(false)}
            inputs={addTeacherInputs}
            formKeys={addTeacherFormKeys}
            submitItem={createUser as any}
            constantValues={{
              role: RoleEnum.TEACHER,
              school: rowToAction?._id,
            }}
            topClassName="flex flex-col gap-2"
          />
        ),
        isModalOpen: isRegisterTeacherModalOpen,
        setIsModal: setIsRegisterTeacherModalOpen,
        isPath: false,
      },
    ],
    [
      t,
      rowToAction,
      isEditModalOpen,
      inputs,
      formKeys,
      updateSchool,
      user,
      deleteSchool,
      isCloseAllConfirmationDialogOpen,
      createUser,
      addTeacherInputs,
      addTeacherFormKeys,
      isRegisterTeacherModalOpen,
      setIsRegisterTeacherModalOpen,
    ],
  );

  return (
    <>
      <Header showLocationSelector={false} />
      <div className="w-[95%] mx-auto my-10 ">
        <GenericTable
          rowKeys={rowKeys}
          actions={actions}
          columns={columns}
          rows={rows ?? []}
          title={t("Schools")}
          addButton={addButton}
          isActionsActive={true}
        />
      </div>
    </>
  );
};

export default Schools;
