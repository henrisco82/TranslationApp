import { DAY_OPTION, DATE_OPTION, TRANSLATIONS } from "./Translate";
import { ValueGetterParams, ValueFormatterParams } from "ag-grid-community";

const translate = (key: string, language: string): string => {
  return TRANSLATIONS[language][key];
};

const translateDateTime = (
  date: Date,
  language: string,
  options: {}
): string => {
  return date.toLocaleDateString(language, options);
};

const translatePrice = (value: number, language: string): string => {
  let currency = language === "en-GB" ? "GBP" : "EUR";
  return value.toLocaleString(language, {
    minimumFractionDigits: 2,
    style: "currency",
    currency: currency
  });
};

interface WithValueGetter {
  valueGetterFn(language: string): (params: ValueGetterParams) => string;
}

const DAY_VALUEGETTER: WithValueGetter = {
  valueGetterFn: (language) => (params) =>
    translateDateTime(params.data.date, language, DAY_OPTION)
};



const TEXT_VALUEGETTER: WithValueGetter = {
  valueGetterFn: (language) => (params) => {
    let field = params.column.getColDef().field as string;
    return translate(params.data[field], language);
  }
};

interface WithValueFormatter {
  valueFormatterFn(language: string): (params: ValueFormatterParams) => string;
}

const DAY_VALUEFORMATTER: WithValueFormatter = {
  valueFormatterFn: () => (params) => params.data.day
};
const DATE_VALUEFORMATTER: WithValueFormatter = {
  valueFormatterFn: (language) => (params) =>
    translateDateTime(params.data.date, language, DATE_OPTION)
};

const PRICE_VALUEFORMATTER: WithValueFormatter = {
  valueFormatterFn: (language) => (params) =>
    translatePrice(params.data.price, language)
};

const columnFactory = (
  colId: string,
  field: string,
  filterType: string,
  language: string,
  valueFormatterFn?: WithValueFormatter,
  valueGetterFn?: WithValueGetter
) => {
  return {
    colId,
    field,
    headerName: translate(colId.toUpperCase(), language),
    filter: filterType,
    ...(valueFormatterFn == null
      ? undefined
      : { valueFormatter: valueFormatterFn.valueFormatterFn(language) }),
    ...(valueGetterFn == null
      ? undefined
      : { valueGetter: valueGetterFn.valueGetterFn(language) })
  };
};

const translateColumnFactory = (
  colId: string,
  field: string,
  filterType: string,
  language: string,
  valueFormatter?: WithValueFormatter,
  valueGetter?: WithValueGetter,
  other?: object
) => {
  let column = columnFactory(
    colId,
    field,
    filterType,
    language,
    valueFormatter,
    valueGetter
  );

  Object.assign(column, other);
  return column;
};

export const getColumnDefs = (language: string) => [
  // Day of week.
  translateColumnFactory(
    "day",
    "date",
    "agSetColumnFilter",
    language,
    undefined,
    DAY_VALUEGETTER
  ),
  // Date of day.
  translateColumnFactory(
    "date",
    "date",
    "agDateColumnFilter",
    language,
    DATE_VALUEFORMATTER,
    undefined,
    {
      filterParams: {
        suppressAndOrCondition: true,
        filterOptions: ["equals"]
      }
    }
  ),
  // Occasion.
  translateColumnFactory(
    "mealTime",
    "mealTime",
    "agSetColumnFilter",
    language,
    undefined,
    TEXT_VALUEGETTER,
    {
      filterParams: {
        suppressSelectAll: true,
        suppressMiniFilter: true
      }
    }
  ),
  translateColumnFactory(
    "food",
    "food",
    "agTextColumnFilter",
    language,
    undefined,
    TEXT_VALUEGETTER,
    { filterParams: { filterOptions: ["contains"] } }
  ),
  translateColumnFactory(
    "price",
    "price",
    "agNumberColumnFilter",
    language,
    PRICE_VALUEFORMATTER,
    undefined,
    {
      filterParams: {
        filterOptions: ["equals", "lessThan", "greaterThan"],
        buttons: ["apply", "reset"],
        suppressAndOrCondition: true,
        allowedCharPattern: "\\d\\,\\.",
        numberParser: (value?: string) => {
          if (value == null) {
            return null;
          }
          let filterVal = value.replace(",", ".");
          return Number(filterVal);
        }
      }
    }
  )
];

