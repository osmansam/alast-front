import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Class, FormElementsState, gradeInputs, School, User } from "../types";
import { useClassMutations, useGetClasses } from "../utils/api/class";
import { useGetSchools } from "../utils/api/school";
import { useGetAllTeachers } from "../utils/api/user";

type ClassRow = Class & {
  teacherName: string;
  schoolName: string;
};

const Classes = () => {
  const { t } = useTranslation();
  const classes = useGetClasses();
  const schools = useGetSchools();
  const teachers = useGetAllTeachers();
  const { updateClass, deleteClass } = useClassMutations();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rowToAction, setRowToAction] = useState<ClassRow>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showClassFilter, setShowClassFilter] = useState(false);
  const [filterClassFormElements, setFilterClassFormElements] =
    useState<FormElementsState>({
      school: "",
      teacher: "",
    });
  const schoolNameById = useMemo(() => {
    const map = new Map<string, string>();
    schools.forEach((school) => {
      map.set(String(school._id), school.name);
    });
    return map;
  }, [schools]);

  const teacherNameById = useMemo(() => {
    const map = new Map<string, string>();
    teachers.forEach((teacher) => {
      map.set(
        String(teacher._id),
        `${teacher.first_name ?? ""} ${teacher.last_name ?? ""}`.trim(),
      );
    });
    return map;
  }, [teachers]);

  const rows = useMemo<ClassRow[]>(() => {
    return (classes ?? [])
      .filter((classItem) => !classItem.isDeleted)
      .map((classItem) => {
        const teacherId = String(
          typeof classItem.teacher === "object"
            ? classItem.teacher?._id
            : classItem.teacher,
        );
        const schoolId = String(
          typeof classItem.school === "object"
            ? classItem.school?._id
            : classItem.school,
        );

        const teacherName =
          typeof classItem.teacher === "object"
            ? `${(classItem.teacher as User)?.first_name ?? ""} ${(classItem.teacher as User)?.last_name ?? ""}`.trim()
            : teacherNameById.get(teacherId) || "";

        const schoolName =
          typeof classItem.school === "object"
            ? (classItem.school as School)?.name || ""
            : schoolNameById.get(schoolId) || "";

        return {
          ...classItem,
          teacherName,
          schoolName,
          teacher:
            typeof classItem.teacher === "object"
              ? teacherId
              : classItem.teacher,
          school:
            typeof classItem.school === "object" ? schoolId : classItem.school,
        } as ClassRow;
      })
      .filter((classItem) => {
        const schoolFilter = filterClassFormElements.school;
        const teacherFilter = filterClassFormElements.teacher;

        if (schoolFilter && String(classItem.school) !== String(schoolFilter)) {
          return false;
        }

        if (
          teacherFilter &&
          String(classItem.teacher) !== String(teacherFilter)
        ) {
          return false;
        }

        return true;
      });
  }, [
    classes,
    filterClassFormElements.school,
    filterClassFormElements.teacher,
    schoolNameById,
    teacherNameById,
  ]);

  const columns = useMemo(
    () => [
      { key: t("School"), isSortable: true },
      { key: t("Teacher"), isSortable: true },
      { key: t("Class Name"), isSortable: true },
      { key: t("Class ID"), isSortable: true },
      { key: t("Grade"), isSortable: true },
      { key: t("Actions"), isSortable: false },
    ],
    [t],
  );

  const rowKeys = useMemo(
    () => [
      { key: "schoolName" },
      { key: "teacherName" },
      { key: "name" },
      { key: "classId" },
      { key: "grade" },
    ],
    [],
  );

  const inputs = useMemo(
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

  const formKeys = useMemo(
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
            submitItem={updateClass as any}
            isEditMode={true}
            topClassName="flex flex-col gap-2"
            itemToEdit={{
              id: rowToAction._id,
              updates: {
                _id: rowToAction._id,
                school: rowToAction.school,
                teacher: rowToAction.teacher,
                name: rowToAction.name,
                classId: rowToAction.classId,
                grade: rowToAction.grade,
                isDeleted: rowToAction.isDeleted,
              },
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
            isOpen={isDeleteDialogOpen}
            close={() => setIsDeleteDialogOpen(false)}
            confirm={() => {
              deleteClass(rowToAction._id);
              setIsDeleteDialogOpen(false);
            }}
            title={t("Delete Class")}
            text={`${rowToAction.name} ${t("GeneralDeleteMessage")}`}
          />
        ) : null,
        className: "text-red-500 cursor-pointer text-2xl",
        isModal: true,
        isModalOpen: isDeleteDialogOpen,
        setIsModal: setIsDeleteDialogOpen,
        isPath: false,
      },
    ],
    [
      t,
      rowToAction,
      isEditModalOpen,
      inputs,
      formKeys,
      updateClass,
      isDeleteDialogOpen,
      deleteClass,
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
        required: false,
        invalidateKeys: [{ key: "teacher", defaultValue: "" }],
      },
      {
        type: InputTypes.SELECT,
        formKey: "teacher",
        label: t("Teacher"),
        options: teachers
          .filter(
            (teacher) =>
              (teacher?.school as School)?._id ===
              filterClassFormElements.school,
          )
          .map((teacher) => ({
            label: `${teacher.first_name} ${teacher.last_name}`,
            value: teacher._id,
          })),
        placeholder: t("Teacher"),
        isMultiple: false,
        required: false,
      },
    ],
    [t, schools, teachers, filterClassFormElements],
  );
  const filterPanel = useMemo(
    () => ({
      isFilterPanelActive: showClassFilter,
      inputs: filterPanelInputs,
      formElements: filterClassFormElements,
      setFormElements: setFilterClassFormElements,
      closeFilters: () => setShowClassFilter(false),
    }),
    [
      showClassFilter,
      filterPanelInputs,
      filterClassFormElements,
      setFilterClassFormElements,
    ],
  );

  const filters = useMemo(
    () => [
      {
        label: t("Show Filters"),
        isUpperSide: true,
        node: (
          <SwitchButton
            checked={showClassFilter}
            onChange={() => {
              setShowClassFilter(!showClassFilter);
            }}
          />
        ),
      },
    ],
    [t, showClassFilter],
  );

  return (
    <>
      <Header showLocationSelector={false} />
      <div className="w-[95%] mx-auto my-10 flex flex-col gap-4">
        <GenericTable
          rowKeys={rowKeys}
          columns={columns}
          rows={rows}
          title={t("Classes")}
          actions={actions}
          isActionsActive={true}
          filterPanel={filterPanel}
          filters={filters}
        />
      </div>
    </>
  );
};

export default Classes;
