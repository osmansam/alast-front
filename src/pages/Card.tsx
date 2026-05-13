import { useEffect, useMemo, useState } from "react";
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
import { Card as CardType, languageOptions } from "../types";
import {
  useCardMutations,
  useGenerateCardSetCards,
  useGetCards,
  useTranslateCardSet,
} from "../utils/api/card";
import { useGetCardSets } from "../utils/api/cardSet";

type CardRow = CardType & {
  cardSetName: string;
};

const normalizeLangCode = (value: string) => value.toLowerCase().split("-")[0];

const getLocalizedMap = (value: unknown): Record<string, string> | null => {
  if (value instanceof Map) {
    return Object.fromEntries(value.entries());
  }

  if (typeof value === "object" && value !== null) {
    return value as Record<string, string>;
  }

  return null;
};

const getLocalizedText = (value: unknown, selectedLanguage: string) => {
  if (typeof value === "string") {
    return value;
  }

  const localizedMap = getLocalizedMap(value);
  if (!localizedMap) {
    return "";
  }

  const requestedLang = normalizeLangCode(selectedLanguage);
  const matchedKey = Object.keys(localizedMap).find(
    (key) => normalizeLangCode(key) === requestedLang,
  );

  if (matchedKey && localizedMap[matchedKey]) {
    return localizedMap[matchedKey];
  }

  return Object.values(localizedMap)[0] || "";
};

const getFieldLanguages = (value: unknown) => {
  const localizedMap = getLocalizedMap(value);

  if (!localizedMap) {
    return [];
  }

  return Object.keys(localizedMap).map(normalizeLangCode);
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
  lang: string;
  [key: string]: string | number;
};

type TranslateCardForm = {
  lang: string;
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
  const { mutate: translateCardSet } = useTranslateCardSet(
    cardSetId ? Number(cardSetId) : undefined,
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);
  const [rowToAction, setRowToAction] = useState<CardRow>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [generateForm, setGenerateForm] = useState<GenerateCardForm>({
    topic: "",
    lang: "en",
  });
  const [translateForm, setTranslateForm] = useState<TranslateCardForm>({
    lang: "en",
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
  console.log("Current Cards:", currentCards);
  const rows = currentCards;

  const availableLanguageOptions = useMemo(() => {
    const map = new Map<string, string>();

    languageOptions.forEach((option) => {
      const value = normalizeLangCode(option.code);
      map.set(value, option.label);
    });

    currentCards.forEach((card) => {
      getFieldLanguages(card.content).forEach((lang) => {
        if (!map.has(lang)) {
          map.set(lang, lang.toUpperCase());
        }
      });

      getFieldLanguages(card.answer).forEach((lang) => {
        if (!map.has(lang)) {
          map.set(lang, lang.toUpperCase());
        }
      });
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [currentCards]);

  const currentCardSetLanguageOptions = useMemo(() => {
    const langSet = new Set<string>();

    currentCards.forEach((card) => {
      getFieldLanguages(card.content).forEach((lang) => {
        langSet.add(lang);
      });

      getFieldLanguages(card.answer).forEach((lang) => {
        langSet.add(lang);
      });
    });

    return availableLanguageOptions.filter((option) =>
      langSet.has(String(option.value)),
    );
  }, [currentCards, availableLanguageOptions]);

  useEffect(() => {
    if (currentCardSetLanguageOptions.length === 0) {
      return;
    }

    const isSelectedAvailable = currentCardSetLanguageOptions.some(
      (option) => option.value === selectedLanguage,
    );

    if (!isSelectedAvailable) {
      setSelectedLanguage(String(currentCardSetLanguageOptions[0].value));
    }
  }, [currentCardSetLanguageOptions, selectedLanguage]);

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

  const rowKeys = useMemo(
    () => [
      {
        key: "content",
        node: (row: CardRow) => getLocalizedText(row.content, selectedLanguage),
      },
      {
        key: "answer",
        node: (row: CardRow) => getLocalizedText(row.answer, selectedLanguage),
      },
    ],
    [selectedLanguage],
  );

  const answerOptions = useMemo(
    () => getAnswerOptionsByGameType(currentCardSet?.game_type),
    [currentCardSet?.game_type],
  );

  const generationInputs = useMemo(
    () => [
      {
        type: InputTypes.SELECT,
        formKey: "lang",
        label: t("Language"),
        placeholder: t("Language"),
        options: availableLanguageOptions,
        isSortDisabled: true,
        isMultiple: false,
        required: true,
      },
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
    [t, answerOptions, availableLanguageOptions],
  );

  const generationDefaultValues = useMemo(
    () =>
      answerOptions.reduce<Record<string, number | string>>(
        (accumulator, option) => {
          accumulator[option.value] = 0;
          return accumulator;
        },
        {
          topic: "",
          lang: String(availableLanguageOptions[0]?.value || "en"),
        },
      ),
    [answerOptions, availableLanguageOptions],
  );

  const generationFormKeys = useMemo(
    () => [
      { key: "lang", type: FormKeyTypeEnum.STRING },
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
      lang:
        String(generateForm.lang ?? "").trim() ||
        String(availableLanguageOptions[0]?.value || "en"),
    });

    resetGenerateForm();
    setIsGenerateModalOpen(false);
  };

  const translateInputs = useMemo(
    () => [
      {
        type: InputTypes.SELECT,
        formKey: "lang",
        label: t("Language"),
        placeholder: t("Language"),
        options: availableLanguageOptions,
        isSortDisabled: true,
        isMultiple: false,
        required: true,
      },
    ],
    [t, availableLanguageOptions],
  );

  const translateFormKeys = useMemo(
    () => [{ key: "lang", type: FormKeyTypeEnum.STRING }],
    [],
  );

  const translateDefaultValues = useMemo(
    () => ({
      lang: String(availableLanguageOptions[0]?.value || "en"),
    }),
    [availableLanguageOptions],
  );

  const handleTranslateCards = () => {
    const language = String(translateForm.lang ?? "").trim();
    if (!language) {
      return;
    }

    translateCardSet({ lang: language });
    setIsTranslateModalOpen(false);
  };

  const inputs = useMemo(
    () => [
      {
        type: InputTypes.SELECT,
        formKey: "cardLanguage",
        label: t("Language"),
        placeholder: t("Language"),
        options: availableLanguageOptions,
        isSortDisabled: true,
        isMultiple: false,
        required: true,
      },
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
    [t, answerOptions, availableLanguageOptions],
  );

  const formKeys = useMemo(
    () => [
      { key: "cardLanguage", type: FormKeyTypeEnum.STRING },
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
            cardLanguage: selectedLanguage,
          }}
          topClassName="flex flex-col gap-2"
        />
      ),
      isModalOpen: isAddModalOpen,
      setIsModal: setIsAddModalOpen,
      isPath: false,
      className: "bg-blue-500 hover:text-blue-500 hover:border-blue-500",
    }),
    [
      t,
      isAddModalOpen,
      inputs,
      formKeys,
      createCard,
      currentCardSetId,
      selectedLanguage,
    ],
  );

  const filters = useMemo(
    () => [
      {
        isUpperSide: false,
        node: (
          <div className="ml-auto flex items-center gap-2">
            {currentCardSetLanguageOptions.length > 1 && (
              <select
                className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
                value={selectedLanguage}
                onChange={(event) => setSelectedLanguage(event.target.value)}
              >
                {currentCardSetLanguageOptions.map((option) => (
                  <option
                    key={String(option.value)}
                    value={String(option.value)}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            <GenericButton
              className={`transition-all ${
                isTranslateModalOpen
                  ? "shadow-[4px_6px_10px_rgba(0,0,0,0.5),-4px_6px_10px_rgba(0,0,0,0.5),0_6px_10px_rgba(0,0,0,0.5)]"
                  : "hover:scale-105"
              }`}
              onClick={() => setIsTranslateModalOpen(true)}
              variant="primary"
              size="sm"
              disabled={availableLanguageOptions.length === 0}
            >
              {t("Translate")}
            </GenericButton>
            <GenericButton
              className={`transition-all ${
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
          </div>
        ),
        isDisabled: answerOptions.length === 0,
      },
    ],
    [
      t,
      answerOptions.length,
      availableLanguageOptions,
      isGenerateModalOpen,
      isTranslateModalOpen,
      selectedLanguage,
      currentCardSetLanguageOptions,
    ],
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
              cardLanguage: selectedLanguage,
            }}
            isEditMode={true}
            topClassName="flex flex-col gap-2"
            itemToEdit={{
              id: rowToAction._id,
              updates: {
                ...rowToAction,
                cardLanguage: selectedLanguage,
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
              deleteCard(rowToAction._id);
              setIsDeleteDialogOpen(false);
            }}
            title={t("Delete Card")}
            text={`${getLocalizedText(rowToAction.content, selectedLanguage)} ${t("GeneralDeleteMessage")}`}
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
      selectedLanguage,
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
      {isTranslateModalOpen && (
        <GenericAddEditPanel
          isOpen={isTranslateModalOpen}
          close={() => {
            setIsTranslateModalOpen(false);
            setTranslateForm(translateDefaultValues);
          }}
          inputs={translateInputs}
          formKeys={translateFormKeys}
          setForm={setTranslateForm}
          submitFunction={handleTranslateCards}
          buttonName={t("Translate")}
          generalClassName="overflow-visible"
          topClassName="flex flex-col gap-2"
          constantValues={translateDefaultValues}
          submitItem={translateCardSet as any}
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
