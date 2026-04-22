import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CiCirclePlus } from "react-icons/ci";
import { FiEdit } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { ConfirmationDialog } from "../common/ConfirmationDialog";
import { Header } from "../components/header/Header";
import SwitchButton from "../components/panelComponents/common/SwitchButton";
import GenericAddEditPanel from "../components/panelComponents/FormElements/GenericAddEditPanel";
import {
  FormKeyTypeEnum,
  InputTypes,
} from "../components/panelComponents/shared/types";
import GenericTable from "../components/panelComponents/Tables/GenericTable";
import { useGeneralContext } from "../context/General.context";
import { gradeInputs, School, User } from "../types";
import { useClassMutations } from "../utils/api/class";
import { useGetSchools } from "../utils/api/school";
import { useGetTeachers, useUserMutations } from "../utils/api/user";

type TeacherRow = Omit<User, "school"> & {
  school: string;
  firstName: string;
  lastName: string;
  schoolId: string;
};
const Teachers = () => {
  const { t } = useTranslation();
  const schools = useGetSchools();
  const [isRegisterClassModalOpen, setIsRegisterClassModalOpen] =
    useState(false);
  const { createClass } = useClassMutations();
  const { updateUser } = useUserMutations();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const {
    filterTeacherFormElements,
    setFilterTeacherFormElements,
    showTeacherFilter,
    setShowTeacherFilter,
  } = useGeneralContext();
  const [rowToAction, setRowToAction] = useState<TeacherRow>();
  const [
    isCloseAllConfirmationDialogOpen,
    setIsCloseAllConfirmationDialogOpen,
  ] = useState(false);
  const teachers = useGetTeachers();

  const rows = useMemo<TeacherRow[]>(() => {
    return (teachers ?? []).map((teacher) => {
      return {
        ...teacher,
        school: teacher?.school ? (teacher?.school as School)?.name : "",
        schoolId: teacher?.school ? (teacher?.school as School)?._id : "",
        firstName: teacher.first_name,
        lastName: teacher.last_name,
      };
    });
  }, [teachers, schools]);

  const columns = useMemo(
    () => [
      { key: t("School"), isSortable: true },
      { key: t("LastName"), isSortable: true },
      { key: t("FirstName"), isSortable: true },
      { key: t("Actions"), isSortable: false },
    ],
    [t],
  );

  const rowKeys = useMemo(
    () => [{ key: "school" }, { key: "lastName" }, { key: "firstName" }],
    [],
  );
  const inputs = useMemo(
    () => [
      {
        type: InputTypes.SELECT,
        formKey: "school",
        label: t("School"),
        placeholder: t("School"),
        required: false,
        isReadOnly: true,
      },
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
    ],
    [t],
  );

  const formKeys = useMemo(
    () => [
      { key: "school", type: FormKeyTypeEnum.STRING },
      { key: "first_name", type: FormKeyTypeEnum.STRING },
      { key: "last_name", type: FormKeyTypeEnum.STRING },
    ],
    [],
  );

  const classInputs = useMemo(
    () => [
      {
        type: InputTypes.SELECT,
        formKey: "school",
        label: t("School"),
        options: schools.map((school) => ({
          label: school.name,
          value: school._id,
        })),
        placeholder: t("School"),
        isMultiple: false,
        isReadOnly: true,
        required: true,
      },
      {
        type: InputTypes.SELECT,
        formKey: "teacher",
        label: t("Teacher"),
        options: teachers.map((teacher) => ({
          label: `${teacher.first_name} ${teacher.last_name}`,
          value: teacher._id,
        })),
        placeholder: t("Teacher"),
        isMultiple: false,
        isReadOnly: true,
        required: true,
      },
      {
        type: InputTypes.TEXT,
        formKey: "name",
        label: t("Class Name"),
        placeholder: t("Class Name"),
        required: true,
      },
      {
        type: InputTypes.TEXT,
        formKey: "classId",
        label: t("Class ID"),
        placeholder: t("Class ID"),
        required: true,
      },
      {
        type: InputTypes.SELECT,
        formKey: "grade",
        label: t("Grade"),
        placeholder: t("Grade"),
        required: true,
        options: gradeInputs,
      },
    ],
    [t, schools, teachers, gradeInputs],
  );

  const classFormKeys = useMemo(
    () => [
      { key: "school", type: FormKeyTypeEnum.STRING },
      { key: "teacher", type: FormKeyTypeEnum.NUMBER },
      { key: "name", type: FormKeyTypeEnum.STRING },
      { key: "classId", type: FormKeyTypeEnum.STRING },
      { key: "grade", type: FormKeyTypeEnum.NUMBER },
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
            title={t("Delete Teacher")}
            text={`${rowToAction.firstName} ${rowToAction.lastName} ${t("GeneralDeleteMessage")}`}
          />
        ) : null,
        className: "text-red-500 cursor-pointer text-2xl  ",
        isModal: true,
        isModalOpen: isCloseAllConfirmationDialogOpen,
        setIsModal: setIsCloseAllConfirmationDialogOpen,
        isPath: false,
      },
      {
        name: t("Register Class"),
        icon: <CiCirclePlus />,
        className: "text-2xl mt-1 cursor-pointer",
        isModal: true,
        setRow: setRowToAction,
        modal: (
          <GenericAddEditPanel
            isOpen={isRegisterClassModalOpen}
            close={() => setIsRegisterClassModalOpen(false)}
            inputs={classInputs}
            formKeys={classFormKeys}
            submitItem={createClass as any}
            constantValues={{
              teacher: rowToAction?._id,
              school: rowToAction?.schoolId,
            }}
            topClassName="flex flex-col gap-2"
          />
        ),
        isModalOpen: isRegisterClassModalOpen,
        setIsModal: setIsRegisterClassModalOpen,
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
      isRegisterClassModalOpen,
      classInputs,
      classFormKeys,
      createClass,
    ],
  );

  const filterPanelInputs = useMemo(
    () => [
      {
        type: InputTypes.SELECT,
        formKey: "school",
        label: t("School"),
        options: schools.map((school) => ({
          label: school.name,
          value: school._id,
        })),
        placeholder: t("School"),
        isMultiple: false,
        required: true,
      },
    ],
    [t, schools],
  );

  const filterPanel = useMemo(
    () => ({
      isFilterPanelActive: showTeacherFilter,
      inputs: filterPanelInputs,
      formElements: filterTeacherFormElements,
      setFormElements: setFilterTeacherFormElements,
      closeFilters: () => setShowTeacherFilter(false),
    }),
    [
      showTeacherFilter,
      filterPanelInputs,
      filterTeacherFormElements,
      setFilterTeacherFormElements,
      setShowTeacherFilter,
    ],
  );
  const filters = useMemo(
    () => [
      {
        label: t("Show Filters"),
        isUpperSide: true,
        node: (
          <SwitchButton
            checked={showTeacherFilter}
            onChange={() => {
              setShowTeacherFilter(!showTeacherFilter);
            }}
          />
        ),
      },
    ],
    [t, showTeacherFilter],
  );

  return (
    <>
      <Header showLocationSelector={false} />
      <div className="w-[95%] mx-auto my-10 flex flex-col gap-4">
        <GenericTable
          rowKeys={rowKeys}
          columns={columns}
          rows={rows}
          title={t("Teachers")}
          actions={actions}
          isActionsActive={true}
          filterPanel={filterPanel}
          filters={filters}
        />
      </div>
    </>
  );
};

export default Teachers;
