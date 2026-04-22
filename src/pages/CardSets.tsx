import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEdit } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { ConfirmationDialog } from "../common/ConfirmationDialog";
import { Header } from "../components/header/Header";
import GenericAddEditPanel from "../components/panelComponents/FormElements/GenericAddEditPanel";
import GenericTable from "../components/panelComponents/Tables/GenericTable";
import {
  FormKeyTypeEnum,
  InputTypes,
} from "../components/panelComponents/shared/types";
import { useGeneralContext } from "../context/General.context";
import { CardSet, gameTypeInputs, User } from "../types";
import { useCardSetMutations, useGetCardSets } from "../utils/api/cardSet";
import { useGetAllTeachers } from "../utils/api/user";

type CardSetRow = CardSet & {
  teacherName: string;
};

const CardSets = () => {
  const { t } = useTranslation();
  const cardSets = useGetCardSets();
  const teachers = useGetAllTeachers();
  const navigate = useNavigate();
  const { createCardSet, updateCardSet, deleteCardSet } = useCardSetMutations();
  const { setCurrentPage, setSearchQuery, setSortConfigKey } =
    useGeneralContext();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rowToAction, setRowToAction] = useState<CardSetRow>();
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

  const rows = useMemo<CardSetRow[]>(() => {
    return (cardSets ?? [])
      .filter((cardSet) => !cardSet.isDeleted)
      .map((cardSet) => {
        const teacherId = String(
          typeof cardSet.teacher === "object"
            ? cardSet.teacher?._id
            : cardSet.teacher,
        );

        const teacherName =
          typeof cardSet.teacher === "object"
            ? `${(cardSet.teacher as User)?.first_name ?? ""} ${(cardSet.teacher as User)?.last_name ?? ""}`.trim()
            : teacherNameById.get(teacherId) || "";

        return {
          ...cardSet,
          teacher:
            typeof cardSet.teacher === "object"
              ? Number(teacherId)
              : cardSet.teacher,
          teacherName,
        };
      });
  }, [cardSets, teacherNameById]);

  const columns = useMemo(
    () => [
      { key: t("Name"), isSortable: true },
      { key: t("Game Type"), isSortable: true },
      { key: t("Teacher"), isSortable: true },
      { key: t("Actions"), isSortable: false },
    ],
    [t],
  );

  const rowKeys = useMemo(
    () => [
      {
        key: "name",
        node: (row: CardSetRow) => {
          return (
            <p
              className="text-blue-700 w-fit cursor-pointer hover:text-blue-500 transition-transform"
              onClick={() => {
                setCurrentPage(1);
                setSearchQuery("");
                setSortConfigKey(null);
                navigate(`/card/${row._id}`);
              }}
            >
              {row.name}
            </p>
          );
        },
      },
      {
        key: "game_type",
        node: (row: CardSetRow) => {
          const gameType = gameTypeInputs.find(
            (type) => String(type.value) === String(row.game_type),
          );
          return <span>{gameType ? gameType.label : row.game_type}</span>;
        },
      },
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
        type: InputTypes.SELECT,
        formKey: "game_type",
        label: t("Game Type"),
        placeholder: t("Game Type"),
        required: true,
        options: gameTypeInputs,
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
      { key: "game_type", type: FormKeyTypeEnum.STRING },
      { key: "teacher", type: FormKeyTypeEnum.NUMBER },
    ],
    [],
  );

  const addButton = useMemo(
    () => ({
      name: t("Add Card Set"),
      isModal: true,
      modal: (
        <GenericAddEditPanel
          isOpen={isAddModalOpen}
          close={() => setIsAddModalOpen(false)}
          inputs={inputs}
          formKeys={formKeys}
          submitItem={createCardSet as any}
          topClassName="flex flex-col gap-2"
        />
      ),
      isModalOpen: isAddModalOpen,
      setIsModal: setIsAddModalOpen,
      isPath: false,
      className: "bg-blue-500 hover:text-blue-500 hover:border-blue-500",
    }),
    [t, isAddModalOpen, inputs, formKeys, createCardSet],
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
            submitItem={updateCardSet as any}
            constantValues={{
              game_type: rowToAction.game_type,
            }}
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
              deleteCardSet(rowToAction._id);
              setIsDeleteDialogOpen(false);
            }}
            title={t("Delete Card Set")}
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
      updateCardSet,
      isDeleteDialogOpen,
      deleteCardSet,
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
          title={t("Card Sets")}
          addButton={addButton}
          isActionsActive={true}
        />
      </div>
    </>
  );
};

export default CardSets;
