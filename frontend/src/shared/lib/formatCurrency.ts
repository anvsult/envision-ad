interface FormatCurrencyOptions {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

export const formatCurrency = (
    amount: number,
    options: FormatCurrencyOptions = {}
) => {
    const {
        locale = "en",
        currency = "CAD",
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
    } = options;

    const formatter = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    });

    const formattedAmount = formatter.format(amount);
    if (currency !== "CAD") {
        return formattedAmount;
    }

    const currencyPart = formatter
        .formatToParts(amount)
        .find((part) => part.type === "currency")?.value;

    // Ensure CAD is always visually explicit as "CA$" in UI.
    if (currencyPart === "$") {
        return formattedAmount.replace("$", "CA$");
    }

    return formattedAmount;
};
