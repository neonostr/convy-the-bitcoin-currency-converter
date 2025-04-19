
export type Language = 'en' | 'es' | 'de';

export interface Translations {
  settings: {
    title: string;
    appearance: string;
    language: string;
    version: string;
    priceTracker: {
      title: string;
      description: string;
      toggle: string;
      btcPriceTrackerMode: string;
    };
    numberFormat: {
      title: string;
      useCommaAsDecimalSeparator: string;
      includeThousandSeparatorsWhenCopying: string;
    };
    displayCurrencies: {
      title: string;
      description: string;
      selected: string;
      available: string;
      dragToReorder: string;
    };
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
