import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiEdit } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { useParams } from "react-router-dom";
import { ConfirmationDialog } from "../common/ConfirmationDialog";
import { GenericButton } from "../common/GenericButton";
import { Header } from "../components/header/Header";
import GenericAddEditPanel from "../components/panelComponents/FormElements/GenericAddEditPanel";
import PageNavigator from "../components/panelComponents/PageNavigator/PageNavigator";
import GenericTable from "../components/panelComponents/Tables/GenericTable";
import {
  FormKeyTypeEnum,
  InputTypes,
} from "../components/panelComponents/shared/types";
import { useGeneralContext } from "../context/General.context";
import { Routes } from "../navigation/constants";
import { Card as CardType } from "../types";
import {
  useCardMutations,
  useGenerateCardSetCards,
  useGetCards,
} from "../utils/api/card";
import { useGetCardSets } from "../utils/api/cardSet";

type CardRow = CardType & {
  cardSetName: string;
};

const getAnswerOptionsByGameType = (gameType?: string | number) => {
  switch (Number(gameType)) {
    case 1:
      return [
        { value: "Claim", label: "Claim" },
        { value: "Evidence", label: "Evidence" },
      ];
    case 2:
      return [
        { value: "EvidenceCon", label: "EvidenceCon" },
        { value: "EvidencePro", label: "EvidencePro" },
        { value: "NotEvidence", label: "NotEvidence" },
      ];
    case 3:
      return [
        { value: "Claim", label: "Claim" },
        { value: "CounterClaim", label: "CounterClaim" },
        { value: "Reasoning", label: "Reasoning" },
        { value: "CounterReasoning", label: "CounterReasoning" },
        { value: "CounterEvidence", label: "CounterEvidence" },
        { value: "Evidence", label: "Evidence" },
      ];
    default:
      return [];
  }
};

type GenerateCardForm = {
  topic: string;
  [key: string]: string | number;
};

const Card = () => {
  const { t } = useTranslation();
  const { setCurrentPage, setSearchQuery, setSortConfigKey } =
    useGeneralContext();
  const { cardSetId } = useParams();
  const cards = useGetCards();
  const cardSets = useGetCardSets();
  const { createCard, updateCard, deleteCard } = useCardMutations();
  const { mutate: generateCards } = useGenerateCardSetCards(
    cardSetId ? Number(cardSetId) : undefined,
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [rowToAction, setRowToAction] = useState<CardRow>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState<GenerateCardForm>({
    topic: "",
  });

  const currentCardSetId = Number(cardSetId);
  const currentCardSet = useMemo(
    () => cardSets.find((cardSet) => Number(cardSet._id) === currentCardSetId),
    [cardSets, currentCardSetId],
  );

  const cardSetNameById = useMemo(() => {
    const map = new Map<string, string>();
    cardSets.forEach((cardSet) => {
      map.set(String(cardSet._id), cardSet.name);
    });
    return map;
  }, [cardSets]);

  const currentCards = useMemo<CardRow[]>(() => {
    return (cards ?? [])
      .filter((card) => !card.isDeleted)
      .map((card) => {
        const resolvedCardSetId =
          typeof card.cardSet === "object" ? card.cardSet?._id : card.cardSet;

        return {
          ...card,
          cardSet:
            typeof card.cardSet === "object"
              ? Number(resolvedCardSetId)
              : card.cardSet,
          cardSetName:
            typeof card.cardSet === "object"
              ? card.cardSet?.name || ""
              : cardSetNameById.get(String(resolvedCardSetId)) || "",
        };
      })
      .filter((card) => String(card.cardSet) === String(currentCardSetId));
  }, [cards, currentCardSetId, cardSetNameById]);

  const rows = currentCards;

  const pageNavigations = useMemo(
    () => [
      {
        name: t("Card Sets"),
        path: Routes.CardSets,
        canBeClicked: true,
        additionalSubmitFunction: () => {
          setCurrentPage(1);
          setSortConfigKey(null);
          setSearchQuery("");
        },
      },
      {
        name: currentCardSet?.name || t("Cards"),
        path: "",
        canBeClicked: false,
      },
    ],
    [t, currentCardSet?.name, setCurrentPage, setSortConfigKey, setSearchQuery],
  );

  const columns = useMemo(
    () => [
      { key: t("Content"), isSortable: true },
      { key: t("Answer"), isSortable: true },
      { key: t("Actions"), isSortable: false },
    ],
    [t],
  );

  const rowKeys = useMemo(() => [{ key: "content" }, { key: "answer" }], []);

  const answerOptions = useMemo(
    () => getAnswerOptionsByGameType(currentCardSet?.game_type),
    [currentCardSet?.game_type],
  );

  const generationInputs = useMemo(
    () => [
      {
        type: InputTypes.TEXT,
        formKey: "topic",
        label: t("Topic"),
        placeholder: t("Topic"),
        required: true,
      },
      ...answerOptions.map((option) => ({
        type: InputTypes.NUMBER,
        formKey: option.value,
        label: `${option.label} ${t("Count")}`,
        placeholder: `${option.label} ${t("Count")}`,
        required: true,
        minNumber: 0,
      })),
    ],
    [t, answerOptions],
  );

  const generationDefaultValues = useMemo(
    () =>
      answerOptions.reduce<Record<string, number | string>>(
        (accumulator, option) => {
          accumulator[option.value] = 0;
          return accumulator;
        },
        { topic: "" },
      ),
    [answerOptions],
  );

  const generationFormKeys = useMemo(
    () => [
      { key: "topic", type: FormKeyTypeEnum.STRING },
      ...answerOptions.map((option) => ({
        key: option.value,
        type: FormKeyTypeEnum.NUMBER,
      })),
    ],
    [answerOptions],
  );

  const resetGenerateForm = () => {
    setGenerateForm(generationDefaultValues as GenerateCardForm);
  };

  const handleGenerateCards = () => {
    const counts = answerOptions.reduce<Record<string, number>>(
      (accumulator, option) => {
        const count = Number(generateForm[option.value] ?? 0);
        if (count > 0) {
          accumulator[option.value] = count;
        }
        return accumulator;
      },
      {},
    );

    if (Object.keys(counts).length === 0) {
      return;
    }

    generateCards({
      topic: String(generateForm.topic ?? "").trim(),
      counts,
    });

    resetGenerateForm();
    setIsGenerateModalOpen(false);
  };

  const inputs = useMemo(
    () => [
      {
        type: InputTypes.TEXTAREA,
        formKey: "content",
        label: t("Content"),
        placeholder: t("Content"),
        required: true,
      },
      {
        type: InputTypes.SELECT,
        formKey: "answer",
        label: t("Answer"),
        placeholder: t("Answer"),
        options: answerOptions,
        isSortDisabled: true,
        isMultiple: false,
        required: true,
      },
    ],
    [t, answerOptions],
  );

  const formKeys = useMemo(
    () => [
      { key: "content", type: FormKeyTypeEnum.STRING },
      { key: "answer", type: FormKeyTypeEnum.STRING },
      { key: "cardSet", type: FormKeyTypeEnum.NUMBER },
    ],
    [],
  );

  const addButton = useMemo(
    () => ({
      name: t("Add Card"),
      isModal: true,
      modal: (
        <GenericAddEditPanel
          isOpen={isAddModalOpen}
          close={() => setIsAddModalOpen(false)}
          inputs={inputs}
          formKeys={formKeys}
          submitItem={createCard as any}
          constantValues={{
            cardSet: currentCardSetId,
          }}
          topClassName="flex flex-col gap-2"
        />
      ),
      isModalOpen: isAddModalOpen,
      setIsModal: setIsAddModalOpen,
      isPath: false,
      className: "bg-blue-500 hover:text-blue-500 hover:border-blue-500",
    }),
    [t, isAddModalOpen, inputs, formKeys, createCard, currentCardSetId],
  );

  const filters = useMemo(
    () => [
      {
        isUpperSide: false,
        node: (
          <GenericButton
            className={`ml-auto transition-all ${
              isGenerateModalOpen
                ? "shadow-[4px_6px_10px_rgba(0,0,0,0.5),-4px_6px_10px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.5)]"
                : "hover:scale-105"
            }`}
            onClick={() => setIsGenerateModalOpen(true)}
            variant="primary"
            size="sm"
            disabled={answerOptions.length === 0}
          >
            {t("Generate Multiple")}
          </GenericButton>
        ),
        isDisabled: answerOptions.length === 0,
      },
    ],
    [t, answerOptions.length],
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
            submitItem={updateCard as any}
            constantValues={{
              cardSet: currentCardSetId,
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
              deleteCard(rowToAction._id);
              setIsDeleteDialogOpen(false);
            }}
            title={t("Delete Card")}
            text={`${rowToAction.content} ${t("GeneralDeleteMessage")}`}
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
      updateCard,
      isDeleteDialogOpen,
      deleteCard,
      currentCardSetId,
    ],
  );

  return (
    <>
      <Header showLocationSelector={false} />
      <PageNavigator navigations={pageNavigations} />
      {isGenerateModalOpen && (
        <GenericAddEditPanel
          isOpen={isGenerateModalOpen}
          close={() => {
            setIsGenerateModalOpen(false);
            resetGenerateForm();
          }}
          inputs={generationInputs}
          formKeys={generationFormKeys}
          setForm={setGenerateForm}
          submitFunction={handleGenerateCards}
          buttonName={t("Generate")}
          generalClassName="overflow-visible"
          topClassName="flex flex-col gap-2"
          constantValues={generationDefaultValues}
          submitItem={generateCards as any}
        />
      )}
      <div className="w-[95%] mx-auto my-10">
        <GenericTable
          rowKeys={rowKeys}
          actions={actions}
          columns={columns}
          rows={rows}
          title={currentCardSet?.name || t("Cards")}
          addButton={addButton}
          filters={filters}
          isActionsActive={true}
        />
      </div>
    </>
  );
};

export default Card;
