
import { Translations } from '@/types/language.types';

export const translations: Record<string, Translations> = {
  en: {
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      language: 'Language',
      version: 'Version',
      priceTracker: {
        title: 'Price Tracker',
        description: 'When enabled, the app will automatically show the current value of 1 BTC whenever you open or resume it, while still allowing you to input your own values.',
        toggle: 'Enable Price Tracker',
        btcPriceTrackerMode: 'BTC price tracker mode'
      },
      numberFormat: {
        title: 'Number Format',
        useCommaAsDecimalSeparator: 'Use comma as decimal separator',
        includeThousandSeparatorsWhenCopying: 'Include thousand separators when copying'
      },
      displayCurrencies: {
        title: 'Display Currencies',
        description: 'Select between 2 and 6 currencies to display on the main screen. Drag and drop to reorder.',
        selected: 'Selected Currencies',
        available: 'Available Currencies',
        dragToReorder: 'Drag to reorder'
      }
    },
    converter: {
      title: 'Bitcoin Converter',
      enterAmount: 'Enter amount',
      lastUpdated: 'Last updated',
      tapToCopy: 'Tap any result to copy',
      sourceCode: 'Check my source code',
      addToHomeScreen: 'Add me to your home screen for a seamless web app experience'
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
      language: 'Idioma',
      version: 'Versión',
      priceTracker: {
        title: 'Seguimiento de Precios',
        description: 'Cuando está activado, la aplicación mostrará automáticamente el valor actual de 1 BTC cada vez que la abras o reanudes, mientras que aún te permite ingresar tus propios valores.',
        toggle: 'Activar Seguimiento de Precios',
        btcPriceTrackerMode: 'Modo de seguimiento de precio BTC'
      },
      numberFormat: {
        title: 'Formato de Números',
        useCommaAsDecimalSeparator: 'Usar coma como separador decimal',
        includeThousandSeparatorsWhenCopying: 'Incluir separadores de miles al copiar'
      },
      displayCurrencies: {
        title: 'Mostrar Monedas',
        description: 'Selecciona entre 2 y 6 monedas para mostrar en la pantalla principal. Arrastra y suelta para reordenar.',
        selected: 'Monedas Seleccionadas',
        available: 'Monedas Disponibles',
        dragToReorder: 'Arrastra para reordenar'
      }
    },
    converter: {
      title: 'Conversor de Bitcoin',
      enterAmount: 'Ingresa cantidad',
      lastUpdated: 'Última actualización',
      tapToCopy: 'Toca cualquier resultado para copiar',
      sourceCode: 'Revisa mi código fuente',
      addToHomeScreen: 'Añádeme a tu pantalla de inicio para una experiencia web fluida'
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
      language: 'Sprache',
      version: 'Version',
      priceTracker: {
        title: 'Preisverfolgung',
        description: 'Wenn aktiviert, zeigt die App automatisch den aktuellen Wert von 1 BTC an, wann immer du sie öffnest oder wieder aufnimmst, während du weiterhin deine eigenen Werte eingeben kannst.',
        toggle: 'Preisverfolgung aktivieren',
        btcPriceTrackerMode: 'BTC-Preisverfolgungsmodus'
      },
      numberFormat: {
        title: 'Zahlenformat',
        useCommaAsDecimalSeparator: 'Komma als Dezimaltrennzeichen verwenden',
        includeThousandSeparatorsWhenCopying: 'Tausendertrennzeichen beim Kopieren einschließen'
      },
      displayCurrencies: {
        title: 'Währungen anzeigen',
        description: 'Wähle zwischen 2 und 6 Währungen, die auf dem Hauptbildschirm angezeigt werden sollen. Ziehen und ablegen zum Neuordnen.',
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
      sourceCode: 'Schau dir meinen Quellcode an',
      addToHomeScreen: 'Füge mich deinem Startbildschirm hinzu für ein nahtloses Web-App-Erlebnis'
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
