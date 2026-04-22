import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Experiment, User } from "../types";
import {
  useExperimentMutations,
  useGetExperiments,
} from "../utils/api/experiment";
import { useGetAllTeachers } from "../utils/api/user";

type ExperimentRow = Experiment & {
  teacherName: string;
};

const Experiments = () => {
  const { t } = useTranslation();
  const experiments = useGetExperiments();
  const teachers = useGetAllTeachers();
  const { createExperiment, updateExperiment, deleteExperiment } =
    useExperimentMutations();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rowToAction, setRowToAction] = useState<ExperimentRow>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const rows = useMemo<ExperimentRow[]>(() => {
    return (experiments ?? [])
      .filter((experiment) => !experiment.isDeleted)
      .map((experiment) => {
        const teacherId = String(
          typeof experiment.teacher === "object"
            ? experiment.teacher?._id
            : experiment.teacher,
        );

        const teacherName =
          typeof experiment.teacher === "object"
            ? `${(experiment.teacher as User)?.first_name ?? ""} ${(experiment.teacher as User)?.last_name ?? ""}`.trim()
            : teacherNameById.get(teacherId) || "";

        return {
          ...experiment,
          teacher:
            typeof experiment.teacher === "object"
              ? Number(teacherId)
              : experiment.teacher,
          teacherName,
        };
      });
  }, [experiments, teacherNameById]);

  const columns = useMemo(
    () => [
      { key: t("Name"), isSortable: true },
      { key: t("Type"), isSortable: true },
      { key: t("Description"), isSortable: true },
      { key: t("Teacher"), isSortable: true },
      { key: t("Actions"), isSortable: false },
    ],
    [t],
  );

  const rowKeys = useMemo(
    () => [
      { key: "name" },
      { key: "type" },
      { key: "description" },
      { key: "teacherName" },
    ],
    [],
  );

  const inputs = useMemo(
    () => [
      {
        type: InputTypes.TEXT,
        formKey: "name",
        label: t("Name"),
        placeholder: t("Name"),
        required: true,
      },
      {
        type: InputTypes.TEXT,
        formKey: "type",
        label: t("Type"),
        placeholder: t("Type"),
        required: false,
      },
      {
        type: InputTypes.TEXT,
        formKey: "description",
        label: t("Description"),
        placeholder: t("Description"),
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
        required: true,
      },
    ],
    [t, isAddModalOpen, isEditModalOpen, teachers],
  );

  const formKeys = useMemo(
    () => [
      { key: "name", type: FormKeyTypeEnum.STRING },
      { key: "type", type: FormKeyTypeEnum.STRING },
      { key: "description", type: FormKeyTypeEnum.STRING },
      { key: "teacher", type: FormKeyTypeEnum.NUMBER },
    ],
    [],
  );

  const addButton = useMemo(
    () => ({
      name: t("Add Experiment"),
      isModal: true,
      modal: (
        <GenericAddEditPanel
          isOpen={isAddModalOpen}
          close={() => setIsAddModalOpen(false)}
          inputs={inputs}
          formKeys={formKeys}
          submitItem={createExperiment as any}
          topClassName="flex flex-col gap-2"
        />
      ),
      isModalOpen: isAddModalOpen,
      setIsModal: setIsAddModalOpen,
      isPath: false,
      className: "bg-blue-500 hover:text-blue-500 hover:border-blue-500",
    }),
    [t, isAddModalOpen, inputs, formKeys, createExperiment],
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
            submitItem={updateExperiment as any}
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
            isOpen={isDeleteDialogOpen}
            close={() => setIsDeleteDialogOpen(false)}
            confirm={() => {
              deleteExperiment(rowToAction._id);
              setIsDeleteDialogOpen(false);
            }}
            title={t("Delete Experiment")}
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
      updateExperiment,
      isDeleteDialogOpen,
      deleteExperiment,
    ],
  );

  return (
    <>
      <Header showLocationSelector={false} />
      <div className="w-[95%] mx-auto my-10">
        <GenericTable
          rowKeys={rowKeys}
          actions={actions}
          columns={columns}
          rows={rows}
          title={t("Experiments")}
          addButton={addButton}
          isActionsActive={true}
        />
      </div>
    </>
  );
};

export default Experiments;
