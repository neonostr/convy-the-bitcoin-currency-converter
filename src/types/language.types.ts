
export type Language = 'en' | 'es' | 'de';

export interface Translations {
  settings: {
    title: string;
    appearance: string;
    displayCurrencies: string;
    selectCurrencies: string;
    selectedCurrencies: string;
    availableCurrencies: string;
    dragToReorder: string;
    numberFormat: string;
    useCommaDecimal: string;
    includeThousandSeparator: string;
    priceTracker: {
      title: string;
      description: string;
      toggle: string;
    };
    version: string;
  };
  converter: {
    title: string;
    enterAmount: string;
    lastUpdated: string;
    tapToCopy: string;
    sourceCode: string;
    addToHomeScreen: string;
  };
  donation: {
    button: string;
    title: string;
    subtitle: string;
    generating: string;
    copied: string;
    description: string;
    scanQR: string;
    copyInvoice: string;
    thankYou: {
      title: string;
      subtitle: string;
    };
  };
  common: {
    dark: string;
    light: string;
  };
}
