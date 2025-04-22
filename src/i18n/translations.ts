
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
        description: "When enabled, the app will automatically show the current value of 1 BTC each time you open it, while still allowing you to input your own values.",
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
        description: 'Select between 2 and 6 currencies to show on the main screen. Drag & drop to reorder.',
        selected: 'Selected Currencies',
        available: 'Available Currencies',
        dragToReorder: 'Drag & drop to reorder'
      },
      about: `Meet Convy
your fast, privacy‑first Bitcoin currency converter and real‑time price tracker. All conversions and updates run 100 % on your device—so your data stays private. I’m [Neo](neo). the builder, and I create native web apps for freedom‑loving people who want to escape the walled gardens of Apple and Co. Just add Convy to your home screen, and it behaves like a real app thanks to [PWA](pwa) support.`
    },
    converter: {
      title: 'Bitcoin Converter',
      enterAmount: 'Enter amount',
      lastUpdated: 'Last updated',
      tapToCopy: 'Tap any result to copy',
      sourceCode: 'source code',
      addToHomeScreen: 'Add me to your home screen for a seamless web app experience.',
      ratesFooter: "Tap any result to copy. Rates provided by Coingecko. All calculations are performed 100% offline on your device. You can check my source code to verify. Add me to your home screen for a seamless web app experience."
    },
    donation: {
      button: 'Zap me a coffee',
      title: 'Support This Project',
      subtitle: 'Send a Bitcoin Lightning donation',
      generating: 'Generating Lightning invoice...',
      copied: 'Copied to clipboard',
      description: 'Choose an amount to send:',
      scanQR: 'Scan this QR code with your Lightning wallet to pay',
      copyInvoice: 'Copy Invoice',
      thankYou: {
        title: 'Thank you for your donation!',
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
        description: "Cuando está habilitado, la aplicación mostrará automáticamente el valor actual de 1 BTC cada vez que la abras, y aún podrás ingresar tus propios valores.",
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
        description: 'Selecciona entre 2 y 6 monedas para mostrar en la pantalla principal. Arrástralas para cambiar el orden.',
        selected: 'Monedas Seleccionadas',
        available: 'Monedas Disponibles',
        dragToReorder: 'Arrastra para reordenar'
      },
      about: `Conoce Convy
tu conversor de divisas de Bitcoin rápido y centrado en la privacidad, y rastreador de precios en tiempo real. Todas las conversiones y actualizaciones se realizan al 100 % en tu dispositivo, manteniendo tus datos privados. Soy [Neo](neo), el creador, y diseño aplicaciones web nativas para personas amantes de la libertad que quieran liberarse de los jardines vallados de Apple y compañía. Simplemente agrega convy a tu pantalla de inicio y funcionará como una app real gracias al soporte [PWA](pwa).`
    },
    converter: {
      title: 'Conversor de Bitcoin',
      enterAmount: 'Ingresa cantidad',
      lastUpdated: 'Última actualización',
      tapToCopy: 'Toca cualquier resultado para copiar',
      sourceCode: 'código fuente',
      addToHomeScreen: 'Añádeme a tu pantalla de inicio para una experiencia web fluida.',
      ratesFooter: "Toca cualquier resultado para copiarlo. Las cotizaciones son proporcionadas por CoinGecko. Todos los cálculos se realizan al 100 % sin conexión en tu dispositivo. Puedes revisar el código fuente para comprobarlo. Agrégame a tu pantalla de inicio para disfrutar de una experiencia web fluida."
    },
    donation: {
      button: 'Envíame un café',
      title: 'Apoya Este Proyecto',
      subtitle: 'Envía una donación por Lightning de Bitcoin',
      generating: 'Generando factura Lightning...',
      copied: 'Copiado al portapapeles',
      description: 'Elige una cantidad para enviar:',
      scanQR: 'Escanea este código QR con tu billetera Lightning para pagar',
      copyInvoice: 'Copiar Factura',
      thankYou: {
        title: '¡Gracias por tu donación!',
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
        description: "Ist die Funktion aktiviert, zeigt die App bei jedem Öffnen automatisch den aktuellen Wert von 1 BTC an, während du weiterhin eigene Werte eingeben kannst.",
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
        description: "Wähle zwischen 2 und 6 Währungen, die auf dem Hauptbildschirm angezeigt werden sollen. Ziehe sie per Drag & Drop, um ihre Reihenfolge anzupassen.",
        selected: 'Ausgewählte Währungen',
        available: 'Verfügbare Währungen',
        dragToReorder: 'Drag & Drop zum Neuordnen'
      },
      about: `Lerne Convy kennen
Deinen schnellen, datenschutz­orientierten Bitcoin-Währungs­umrechner und Echtzeit-Preis­tracker. Alle Umrechnungen und Updates laufen zu 100 % auf deinem Gerät – so bleiben deine Daten privat. Ich bin [Neo](neo) und ich erstelle native Web‑Apps für freiheits­liebende Menschen, die den Walled Gardens von Apple & Co. entkommen wollen. Füge Convy einfach deinem Startbildschirm hinzu, und es verhält sich dank [PWA](pwa)‑Funktion wie eine echte App.`
    },
    converter: {
      title: 'Bitcoin-Umrechner',
      enterAmount: 'Betrag eingeben',
      lastUpdated: 'Zuletzt aktualisiert',
      tapToCopy: 'Tippe auf ein Ergebnis zum Kopieren',
      sourceCode: 'Quellcode',
      addToHomeScreen: 'Füge mich deinem Startbildschirm hinzu für ein nahtloses Web-App-Erlebnis.',
      ratesFooter: "Tippe auf ein Ergebnis, um es zu kopieren. Die Kurse werden von CoinGecko bereitgestellt. Alle Berechnungen erfolgen zu 100 % offline auf deinem Gerät. Du kannst den Quellcode jederzeit einsehen, um das zu verifizieren. Füge diese Web‑App deinem Startbildschirm hinzu, um sie nahtlos wie eine native App zu nutzen."
    },
    donation: {
      button: 'Spendiere mir einen Kaffee',
      title: 'Unterstütze dieses Projekt',
      subtitle: 'Sende eine Bitcoin-Lightning-Spende',
      generating: 'Lightning-Rechnung wird erstellt...',
      copied: 'In die Zwischenablage kopiert',
      description: 'Wähle einen Betrag zum Senden:',
      scanQR: 'Scanne diesen QR-Code mit deiner Lightning Wallet um zu bezahlen',
      copyInvoice: 'Rechnung kopieren',
      thankYou: {
        title: 'Vielen Dank für deine Spende!',
        subtitle: 'Deine Spende hilft, dieses Projekt am Laufen zu halten'
      }
    },
    common: {
      dark: 'Dunkel',
      light: 'Hell'
    }
  }
};
