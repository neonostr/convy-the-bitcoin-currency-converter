
import { Translations } from '@/types/language.types';

export const translations: Record<string, Translations> = {
  en: {
    settings: {
      title: 'Settings',
      appearance: 'Appearance',
      displayCurrencies: 'Display Currencies',
      selectCurrencies: 'Select between 2 and 6 currencies to display on the main screen.',
      selectedCurrencies: 'Selected Currencies',
      availableCurrencies: 'Available Currencies',
      dragToReorder: 'Drag to reorder:',
      numberFormat: 'Number Format',
      useCommaDecimal: 'Use comma as decimal separator',
      includeThousandSeparator: 'Include thousand separators when copying',
      priceTracker: {
        title: 'Price Tracker',
        description: 'When enabled, the app will automatically show the current value of 1 BTC whenever you open or resume it, while still allowing you to input your own values.',
        toggle: 'BTC price tracker mode'
      },
      version: 'Version'
    },
    converter: {
      title: 'Bitcoin Currency Converter',
      enterAmount: 'Enter amount',
      lastUpdated: 'Last updated:',
      tapToCopy: 'Tap any result to copy',
      sourceCode: 'Check my source code',
      addToHomeScreen: 'Add me to your home screen for a seamless web app experience'
    },
    donation: {
      button: 'Zap me a coffee',
      title: 'Zap me a coffee',
      subtitle: 'Support this project with some sats',
      generating: 'Generating invoice...',
      copied: 'Copied to clipboard',
      description: 'Copied',
      scanQR: 'Scan with your Lightning wallet',
      copyInvoice: 'Copy invoice',
      thankYou: {
        title: 'Thank you for your support!',
        subtitle: 'Your contribution helps keep this project going'
      }
    },
    common: {
      dark: 'Dark',
      light: 'Light'
    }
  },
  es: {
    settings: {
      title: 'Ajustes',
      appearance: 'Apariencia',
      displayCurrencies: 'Monedas mostradas',
      selectCurrencies: 'Selecciona entre 2 y 6 monedas para mostrar en la pantalla principal.',
      selectedCurrencies: 'Monedas seleccionadas',
      availableCurrencies: 'Monedas disponibles',
      dragToReorder: 'Arrastra para reordenar:',
      numberFormat: 'Formato de números',
      useCommaDecimal: 'Usar coma como separador decimal',
      includeThousandSeparator: 'Incluir separadores de miles al copiar',
      priceTracker: {
        title: 'Seguimiento de precios',
        description: 'Cuando está activado, la app mostrará automáticamente el valor actual de 1 BTC cada vez que la abras o reanudes, permitiéndote aún introducir tus propios valores.',
        toggle: 'Modo seguimiento de precio BTC'
      },
      version: 'Versión'
    },
    converter: {
      title: 'Conversor de Bitcoin',
      enterAmount: 'Ingresa cantidad',
      lastUpdated: 'Última actualización:',
      tapToCopy: 'Toca cualquier resultado para copiar',
      sourceCode: 'Revisa mi código fuente',
      addToHomeScreen: 'Agrégame a tu pantalla de inicio para una experiencia más fluida'
    },
    donation: {
      button: 'Invítame un café',
      title: 'Invítame un café',
      subtitle: 'Apoya este proyecto con algunos sats',
      generating: 'Generando factura...',
      copied: 'Copiado al portapapeles',
      description: 'Copiado',
      scanQR: 'Escanea con tu billetera Lightning',
      copyInvoice: 'Copiar factura',
      thankYou: {
        title: '¡Gracias por tu apoyo!',
        subtitle: 'Tu contribución ayuda a mantener este proyecto'
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
      displayCurrencies: 'Angezeigte Währungen',
      selectCurrencies: 'Wähle zwischen 2 und 6 Währungen für die Hauptansicht aus.',
      selectedCurrencies: 'Ausgewählte Währungen',
      availableCurrencies: 'Verfügbare Währungen',
      dragToReorder: 'Ziehen zum Neuordnen:',
      numberFormat: 'Zahlenformat',
      useCommaDecimal: 'Komma als Dezimaltrennzeichen verwenden',
      includeThousandSeparator: 'Tausendertrennzeichen beim Kopieren einschließen',
      priceTracker: {
        title: 'Preis-Tracker',
        description: 'Wenn aktiviert, zeigt die App automatisch den aktuellen Wert von 1 BTC an, wenn du sie öffnest oder wieder aufrufst. Du kannst trotzdem eigene Werte eingeben.',
        toggle: 'BTC Preis-Tracker Modus'
      },
      version: 'Version'
    },
    converter: {
      title: 'Bitcoin Währungsrechner',
      enterAmount: 'Betrag eingeben',
      lastUpdated: 'Zuletzt aktualisiert:',
      tapToCopy: 'Tippe auf ein Ergebnis zum Kopieren',
      sourceCode: 'Schau dir meinen Quellcode an',
      addToHomeScreen: 'Füge mich deinem Homescreen für eine bessere Erfahrung hinzu'
    },
    donation: {
      button: 'Spendiere mir einen Kaffee',
      title: 'Spendiere mir einen Kaffee',
      subtitle: 'Unterstütze dieses Projekt mit ein paar Sats',
      generating: 'Erstelle Rechnung...',
      copied: 'In die Zwischenablage kopiert',
      description: 'Kopiert',
      scanQR: 'Scanne mit deiner Lightning Wallet',
      copyInvoice: 'Rechnung kopieren',
      thankYou: {
        title: 'Danke für deine Unterstützung!',
        subtitle: 'Dein Beitrag hilft dabei, dieses Projekt am Laufen zu halten'
      }
    },
    common: {
      dark: 'Dunkel',
      light: 'Hell'
    }
  }
};
