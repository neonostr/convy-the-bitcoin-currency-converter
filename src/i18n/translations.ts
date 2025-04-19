
import { Translations } from '@/types/language.types';

export const translations: Record<string, Translations> = {
  en: {
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      displayCurrencies: 'Display Currencies',
      selectCurrencies: 'Select Currencies',
      selectedCurrencies: 'Selected Currencies',
      availableCurrencies: 'Available Currencies',
      dragToReorder: 'Drag to reorder',
      numberFormat: 'Number Format',
      useCommaDecimal: 'Use comma as decimal separator',
      includeThousandSeparator: 'Include thousand separators when copying',
      language: 'Language',
      priceTracker: {
        title: 'Price Tracker',
        description: 'When enabled, the app will always show the current Bitcoin price when opened.',
        toggle: 'Enable Price Tracker',
        btcPriceTrackerMode: 'BTC Price Tracker Mode'
      },
      version: 'Version',
      numberFormat: {
        title: 'Number Format',
        useCommaAsDecimalSeparator: 'Use comma as decimal separator',
        includeThousandSeparatorsWhenCopying: 'Include thousand separators when copying'
      },
      displayCurrencies: {
        title: 'Display Currencies',
        description: 'Select which currencies to display and their order.',
        selected: 'Selected Currencies',
        available: 'Available Currencies',
        dragToReorder: 'Drag to reorder'
      }
    },
    converter: {
      title: 'Bitcoin Converter',
      enterAmount: 'Enter amount',
      lastUpdated: 'Last updated',
      tapToCopy: 'Tap a result to copy',
      sourceCode: 'Source code on GitHub',
      addToHomeScreen: 'Add to home screen for offline use'
    },
    donation: {
      button: 'Zap me a coffee',
      title: 'Support This Project',
      subtitle: 'Send a Bitcoin Lightning donation',
      generating: 'Generating Lightning invoice...',
      copied: 'Copied to clipboard',
      description: 'Choose an amount to send:',
      scanQR: 'Scan with Lightning wallet',
      copyInvoice: 'Copy Invoice',
      thankYou: {
        title: 'Thank You!',
        subtitle: 'Your donation helps keep this project going'
      }
    },
    common: {
      dark: 'Dark',
      light: 'Light'
    }
  },
  es: {
    settings: {
      title: 'Configuración',
      appearance: 'Apariencia',
      displayCurrencies: 'Mostrar Monedas',
      selectCurrencies: 'Seleccionar Monedas',
      selectedCurrencies: 'Monedas Seleccionadas',
      availableCurrencies: 'Monedas Disponibles',
      dragToReorder: 'Arrastra para reordenar',
      numberFormat: 'Formato de Números',
      useCommaDecimal: 'Usar coma como separador decimal',
      includeThousandSeparator: 'Incluir separadores de miles al copiar',
      language: 'Idioma',
      priceTracker: {
        title: 'Seguimiento de Precios',
        description: 'Cuando está activado, la aplicación siempre mostrará el precio actual de Bitcoin al abrirse.',
        toggle: 'Activar Seguimiento de Precios',
        btcPriceTrackerMode: 'Modo de Seguimiento de Precios BTC'
      },
      version: 'Versión',
      numberFormat: {
        title: 'Formato de Números',
        useCommaAsDecimalSeparator: 'Usar coma como separador decimal',
        includeThousandSeparatorsWhenCopying: 'Incluir separadores de miles al copiar'
      },
      displayCurrencies: {
        title: 'Mostrar Monedas',
        description: 'Selecciona qué monedas mostrar y su orden.',
        selected: 'Monedas Seleccionadas',
        available: 'Monedas Disponibles',
        dragToReorder: 'Arrastra para reordenar'
      }
    },
    converter: {
      title: 'Conversor de Bitcoin',
      enterAmount: 'Ingresa cantidad',
      lastUpdated: 'Última actualización',
      tapToCopy: 'Toca un resultado para copiar',
      sourceCode: 'Código fuente en GitHub',
      addToHomeScreen: 'Añadir a la pantalla de inicio para uso sin conexión'
    },
    donation: {
      button: 'Envíame un café',
      title: 'Apoya Este Proyecto',
      subtitle: 'Envía una donación por Lightning de Bitcoin',
      generating: 'Generando factura Lightning...',
      copied: 'Copiado al portapapeles',
      description: 'Elige una cantidad para enviar:',
      scanQR: 'Escanea con billetera Lightning',
      copyInvoice: 'Copiar Factura',
      thankYou: {
        title: '¡Gracias!',
        subtitle: 'Tu donación ayuda a mantener este proyecto'
      }
    },
    common: {
      dark: 'Oscuro',
      light: 'Claro'
    }
  },
  de: {
    settings: {
      title: 'Einstellungen',
      appearance: 'Erscheinungsbild',
      displayCurrencies: 'Währungen anzeigen',
      selectCurrencies: 'Währungen auswählen',
      selectedCurrencies: 'Ausgewählte Währungen',
      availableCurrencies: 'Verfügbare Währungen',
      dragToReorder: 'Ziehen zum Neuordnen',
      numberFormat: 'Zahlenformat',
      useCommaDecimal: 'Komma als Dezimaltrennzeichen verwenden',
      includeThousandSeparator: 'Tausendertrennzeichen beim Kopieren einschließen',
      language: 'Sprache',
      priceTracker: {
        title: 'Preisverfolgung',
        description: 'Wenn aktiviert, zeigt die App beim Öffnen immer den aktuellen Bitcoin-Preis an.',
        toggle: 'Preisverfolgung aktivieren',
        btcPriceTrackerMode: 'BTC-Preisverfolgungsmodus'
      },
      version: 'Version',
      numberFormat: {
        title: 'Zahlenformat',
        useCommaAsDecimalSeparator: 'Komma als Dezimaltrennzeichen verwenden',
        includeThousandSeparatorsWhenCopying: 'Tausendertrennzeichen beim Kopieren einschließen'
      },
      displayCurrencies: {
        title: 'Währungen anzeigen',
        description: 'Wähle aus, welche Währungen angezeigt werden und in welcher Reihenfolge.',
        selected: 'Ausgewählte Währungen',
        available: 'Verfügbare Währungen',
        dragToReorder: 'Ziehen zum Neuordnen'
      }
    },
    converter: {
      title: 'Bitcoin-Umrechner',
      enterAmount: 'Betrag eingeben',
      lastUpdated: 'Zuletzt aktualisiert',
      tapToCopy: 'Tippe auf ein Ergebnis zum Kopieren',
      sourceCode: 'Quellcode auf GitHub',
      addToHomeScreen: 'Zum Startbildschirm hinzufügen für Offline-Nutzung'
    },
    donation: {
      button: 'Spendiere mir einen Kaffee',
      title: 'Unterstütze dieses Projekt',
      subtitle: 'Sende eine Bitcoin-Lightning-Spende',
      generating: 'Lightning-Rechnung wird erstellt...',
      copied: 'In die Zwischenablage kopiert',
      description: 'Wähle einen Betrag zum Senden:',
      scanQR: 'Mit Lightning-Wallet scannen',
      copyInvoice: 'Rechnung kopieren',
      thankYou: {
        title: 'Vielen Dank!',
        subtitle: 'Deine Spende hilft, dieses Projekt am Laufen zu halten'
      }
    },
    common: {
      dark: 'Dunkel',
      light: 'Hell'
    }
  }
};
