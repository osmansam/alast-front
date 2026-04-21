import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoIosClose } from "react-icons/io";
import type { ActionMeta, MultiValue, SingleValue } from "react-select";
import { GenericButton } from "../../../common/GenericButton";
import { useGeneralContext } from "../../../context/General.context";
import type { FormElementsState, OptionType } from "../../../types";
import DateInput from "../FormElements/DateInput";
import HourInput from "../FormElements/HourInput";
import MonthYearInput from "../FormElements/MonthYearInput";
import SelectInput from "../FormElements/SelectInput";
import TextInput from "../FormElements/TextInput";
import { H4, H6 } from "../Typography";
import type { PanelFilterType } from "../shared/types";
import { InputTypes } from "../shared/types";

const FilterPanel = ({
  inputs,
  formElements,
  setFormElements,
  closeFilters,
  isApplyButtonActive = false,
  isCloseButtonActive = true,
  isFilterPanelCoverTable = false,
  additionalFilterCleanFunction,
}: PanelFilterType) => {
  const { t } = useTranslation();
  const { setCurrentPage } = useGeneralContext();
  const [tempFormElements, setTempFormElements] =
    useState<FormElementsState>(formElements);

  const activeFormElements = isApplyButtonActive
    ? tempFormElements
    : formElements;

  const updateFormElements = (
    updater: (prev: FormElementsState) => FormElementsState,
  ) => {
    if (isApplyButtonActive) {
      setTempFormElements(updater);
      return;
    }

    setFormElements(updater);
  };

  const applyFilters = () => {
    setFormElements(tempFormElements);
    setCurrentPage(1);
  };
  const handleClearAllFilters = () => {
    updateFormElements((prev) => {
      const newFormElements = { ...prev };
      inputs.forEach((input) => {
        newFormElements[input.formKey] = "";
      });
      return newFormElements;
    });
    additionalFilterCleanFunction?.();
  };
  const buttons = [
    {
      label: "Clear All Filters",
      onClick: handleClearAllFilters,
      isDisabled: false,
    },
    {
      label: "Apply",
      onClick: applyFilters,
      isDisabled: !isApplyButtonActive,
    },
  ];

  return (
    <div
      className={`flex flex-col gap-3 __className_a182b8 bg-white min-w-full ${
        isFilterPanelCoverTable ? "" : "sm:min-w-[20rem]"
      } border h-fit pb-8 border-gray-200 rounded-md py-2 px-3 focus:outline-none `}
    >
      <div className="flex flex-row justify-between">
        <H4 className="my-1">{t("Filters")}</H4>
        {isCloseButtonActive && (
          <GenericButton onClick={closeFilters} variant="icon">
            <IoIosClose className="w-8 h-8 mx-auto p-1 cursor-pointer  hover:bg-gray-50 hover:rounded-full" />
          </GenericButton>
        )}
      </div>
      {inputs.map((input) => {
        const value = activeFormElements[input.formKey] ?? "";
        const handleChange = (key: string) => (value: string) => {
          const changedInput = inputs.find((input) => input.formKey === key);
          if (changedInput?.invalidateKeys) {
            changedInput.invalidateKeys.forEach((key) => {
              updateFormElements((prev) => ({
                ...prev,
                [key.key]: key.defaultValue,
              }));
            });
          }

          updateFormElements((prev) => ({ ...prev, [key]: value }));
          setCurrentPage(1);
        };

        const handleChangeForSelect =
          (key: string) =>
          (
            selectedValue: SingleValue<OptionType> | MultiValue<OptionType>,
            actionMeta: ActionMeta<OptionType>,
          ) => {
            if (
              actionMeta.action === "select-option" ||
              actionMeta.action === "remove-value" ||
              actionMeta.action === "clear"
            ) {
              if (Array.isArray(selectedValue)) {
                const values = selectedValue.map((option) => option.value);
                updateFormElements((prev) => ({ ...prev, [key]: values }));
              } else if (selectedValue) {
                updateFormElements((prev) => ({
                  ...prev,
                  [key]: (selectedValue as OptionType)?.value,
                }));
              } else {
                updateFormElements((prev) => ({
                  ...prev,
                  [key]: "",
                }));
              }
            }
            const changedInput = inputs.find((input) => input.formKey === key);
            if (changedInput?.invalidateKeys) {
              changedInput.invalidateKeys.forEach((key) => {
                updateFormElements((prev) => ({
                  ...prev,
                  [key.key]: key.defaultValue,
                }));
              });
            }
            if (changedInput?.additionalOnChange) {
              changedInput.additionalOnChange(
                Array.isArray(selectedValue)
                  ? (Array.from(selectedValue) as OptionType[])
                  : (selectedValue as OptionType | null),
              );
            }
            setCurrentPage(1);
          };
        if (input.isDisabled) return null;
        return (
          <div key={input.formKey} className="flex flex-col gap-2">
            {(input.type === InputTypes.TEXT ||
              input.type === InputTypes.NUMBER ||
              input.type === InputTypes.TIME ||
              input.type === InputTypes.COLOR ||
              input.type === InputTypes.PASSWORD) && (
              <TextInput
                key={input.formKey}
                type={input.type}
                value={value}
                label={input.label ?? ""}
                placeholder={input.placeholder ?? ""}
                onChange={handleChange(input.formKey)}
                isDatePicker={input.isDatePicker ?? false}
                isOnClearActive={input?.isOnClearActive}
                isDebounce={input?.isDebounce ?? false}
                onClear={() =>
                  updateFormElements((prev) => ({
                    ...prev,
                    [input.formKey]: "",
                  }))
                }
              />
            )}
            {input.type === InputTypes.DATE && (
              <DateInput
                key={input.formKey}
                value={value}
                label={
                  input.required && input.label
                    ? input.label
                    : (input.label ?? "")
                }
                placeholder={input.placeholder ?? ""}
                onChange={(val) => handleChange(input.formKey)(val ?? "")}
                isArrowsEnabled={input.isArrowsEnabled ?? false}
                requiredField={input.required}
                isOnClearActive={input?.isOnClearActive ?? true}
                isDateInitiallyOpen={input.isDateInitiallyOpen ?? false}
                isTopFlexRow={input.isTopFlexRow ?? false}
                isDebounce={input.isDebounce ?? true}
                isReadOnly={input.isReadOnly ?? false}
              />
            )}
            {input.type === InputTypes.SELECT &&
              !input.isDisabled &&
              (() => {
                const selectOptions = (input.options ?? []) as OptionType[];
                const rawSelectValue = tempFormElements[input.formKey];
                const selectedValues = Array.isArray(rawSelectValue)
                  ? (rawSelectValue as string[])
                  : [];

                return (
                  <SelectInput
                    key={
                      input.isMultiple
                        ? input.formKey
                        : input.formKey + tempFormElements[input.formKey]
                    }
                    value={
                      input.isMultiple
                        ? selectOptions.filter((option) =>
                            selectedValues.includes(option.value),
                          )
                        : (selectOptions.find(
                            (option) => option.value === rawSelectValue,
                          ) ?? null)
                    }
                    label={input.label ?? ""}
                    options={selectOptions}
                    placeholder={input.placeholder ?? ""}
                    isMultiple={input.isMultiple ?? false}
                    isAutoFill={input.isAutoFill ?? true}
                    onChange={handleChangeForSelect(input.formKey)}
                    isOnClearActive={input?.isOnClearActive ?? true}
                    onClear={() => {
                      updateFormElements((prev) => ({
                        ...prev,
                        [input.formKey]: input.isMultiple ? [] : "",
                      }));
                    }}
                  />
                );
              })()}
            {input.type === InputTypes.MONTHYEAR && (
              <MonthYearInput
                key={input.formKey}
                value={value}
                label={
                  input.required && input.label
                    ? input.label
                    : (input.label ?? "")
                }
                onChange={handleChange(input.formKey)}
                requiredField={input.required}
                isReadOnly={input.isReadOnly ?? false}
              />
            )}
            {input.type === InputTypes.TEXTAREA && (
              <div className="flex flex-col gap-2" key={input.formKey}>
                <H6>{input.label}</H6>
                <textarea
                  id={"textarea-input"}
                  value={value}
                  onChange={(e) => {
                    handleChange(input.formKey)(e.target.value);
                  }}
                  placeholder={input.placeholder ?? ""}
                  className="border text-sm border-gray-300 rounded-md p-2"
                />
              </div>
            )}
            {input.type === InputTypes.HOUR && (
              <HourInput
                key={input.formKey}
                value={value}
                label={
                  input.required && input.label
                    ? input.label
                    : (input.label ?? "")
                }
                onChange={handleChange(input.formKey)}
                requiredField={input.required}
                isReadOnly={input.isReadOnly ?? false}
              />
            )}
          </div>
        );
      })}
      <div className="flex flex-row w-fit gap-2 ml-auto">
        {buttons
          .filter((button) => !button.isDisabled)
          .map((button) => {
            return (
              <GenericButton
                key={button.label}
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={button.onClick}
              >
                {t(button.label)}
              </GenericButton>
            );
          })}
      </div>
    </div>
  );
};

export default FilterPanel;
