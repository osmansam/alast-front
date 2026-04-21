import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverHandler,
} from "@material-tailwind/react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { useTranslation } from "react-i18next";

interface Props {
  date: Date;
  setDate: (date: string) => void;
  onMonthChange?: (month: Date) => void;
  openTableDates?: string[];
  compact?: boolean;
}

export function DateInput({
  date,
  setDate,
  onMonthChange,
  openTableDates,
  compact = false,
}: Props) {
  const MTInput = Input as unknown as React.ComponentType<any>;
  const MTPopoverContent =
    PopoverContent as unknown as React.ComponentType<any>;
  const MTButton = Button as unknown as React.ComponentType<any>;

  const { t } = useTranslation();

  const [month, setMonth] = useState<Date>(date);

  const handleToday = () => {
    const today = new Date();
    setDate(format(today, "yyyy-MM-dd"));
    setMonth(today);
  };

  const handleMonthChange = (newMonth: Date) => {
    setMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const openDateObjects = openTableDates
    ? openTableDates.map((d) => parseISO(d))
    : [];

  return (
    <div className={compact ? "" : "p-2"}>
      <Popover placement={compact ? "bottom-end" : "bottom"}>
        <PopoverHandler>
          {compact ? (
            <div className="flex items-center justify-center min-w-[2rem] cursor-pointer hover:scale-110 transition-transform duration-200 text-white text-lg font-medium">
              {format(date, "d")}
            </div>
          ) : (
            <MTInput
              label={t("Select a Date")}
              placeholder=""
              readOnly
              value={date ? format(date, "dd/MM/yyyy") : ""}
              onChange={() => null}
            />
          )}
        </PopoverHandler>
        <MTPopoverContent
          placeholder=""
          className={`p-2 space-y-2 ${compact ? "z-[200]" : ""}`}
        >
          <DayPicker
            month={month}
            onMonthChange={handleMonthChange}
            locale={tr}
            onDayClick={(day) => {
              if (day) {
                setDate(format(day, "yyyy-MM-dd"));
              }
            }}
            showOutsideDays
            captionLayout="dropdown"
            modifiers={{ selected: date, hasOpenTable: openDateObjects }}
            modifiersClassNames={{ hasOpenTable: "has-open-table" }}
          />
          <MTButton
            size="sm"
            color="blue"
            placeholder=""
            onClick={handleToday}
            className="w-full"
          >
            {t("Today")}
          </MTButton>
        </MTPopoverContent>
      </Popover>
    </div>
  );
}
