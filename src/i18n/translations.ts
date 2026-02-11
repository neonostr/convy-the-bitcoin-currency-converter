import { Translations } from "@/types/language.types";

export const translations: Record<string, Translations> = {
  en: {
    settings: {
      title: "Settings",
      appearance: "Appearance",
      language: "Language",
      version: "Version",
      priceTracker: {
        title: "Price Tracker",
        description:
          "When enabled, the app will automatically show the current value of 1 BTC each time you open it, while still allowing you to input your own values.",
        toggle: "Enable Price Tracker",
        btcPriceTrackerMode: "BTC price tracker mode",
        showRateNotifications: "Show rate update notifications",
        notificationsDescription:
          "When enabled, you will get a notification each time rates are automatically updated.",
      },
      persistentInput: {
        title: "Input Behavior",
        label: "Keep input when changing currency",
        description: "Input value stays when switching currencies, only clears on manual focus",
      },
      numberFormat: {
        title: "Number Format",
        useCommaAsDecimalSeparator: "Use comma as decimal separator",
        includeThousandSeparatorsWhenCopying: "Include thousand separators when copying",
      },
      displayCurrencies: {
        title: "Display Currencies",
        description: "Select between 2 and 6 currencies to show on the main screen. Drag & drop to reorder.",
        selected: "Selected Currencies",
        available: "Available Currencies",
        dragToReorder: "Drag & drop to reorder",
      },
      about: {
        title: "Meet Convy",
        description:
          "Your fast, privacy first Bitcoin currency converter and real time price tracker. All conversions and updates run 100% on your device, so your data stays private. I'm [Neo](neo), the builder, and I create native web apps for freedom loving people who want to escape the walled gardens of Apple and Co.",
        checkOutMyApps: "More apps by Neo21.dev",
      },
      shareableUrl: {
        title: "Shareable URL",
        description:
          "Share your custom currency configuration with others or bookmark different setups for easy access. The URL includes your chosen base currency and display currencies, listed in your preferred order.",
        placeholder: "Generating URL...",
        copyTitle: "Copy URL",
        openTitle: "Open in new tab",
        howToUse: "How to use:",
        step1: "Set up your preferred base currency and display currencies",
        step2: "Arrange them in your desired order",
        step3: "Copy the URL above to share your configuration",
        step4: "Anyone opening this URL will see your exact setup",
        copied: "URL Copied",
        copyFailed: "Copy Failed",
        copiedDescription: "Shareable URL copied to clipboard",
        copyFailedDescription: "Failed to copy URL to clipboard",
      },
    },
    converter: {
      title: "Bitcoin Converter",
      enterAmount: "Enter amount",
      lastUpdated: "Last updated",
      gettingRates: "Getting rates...",
      loadingRates: "Loading current Bitcoin rates...",
      tapToCopy: "Tap any result to copy",
      sourceCode: "source code",
      addToHomeScreen: "Add me to your home screen for a seamless web app experience.",
      ratesFooter:
        "Tap any result to copy. Rates provided by Coingecko. All calculations are performed 100% offline on your device. You can check my source code to verify. Add me to your home screen for a seamless web app experience.",
      ratesUpdated: {
        title: "Currency Rates Updated",
        description: "Auto-updates every 60 seconds when activity is detected.",
      },
    },
    donation: {
      button: "Zap me a coffee",
      title: "Support This Project",
      subtitle: "No ads. No tracking. Just sats.",
      generating: "Generating Lightning invoice...",
      copied: "Copied to clipboard",
      description: "Choose an amount to send:",
      scanQR: "Scan this QR code with your Lightning wallet",
      copyInvoice: "Copy Invoice",
      thankYou: {
        title: "Thank you for valuing my work.",
        subtitle: "Your donation helps keep this project going",
      },
    },
    common: {
      dark: "Dark",
      light: "Light",
    },
  },
  es: {
    settings: {
      title: "Configuración",
      appearance: "Apariencia",
      language: "Idioma",
      version: "Versión",
      priceTracker: {
        title: "Seguimiento de Precios",
        description:
          "Cuando está habilitado, la aplicación mostrará automáticamente el valor actual de 1 BTC cada vez que la abras, y aún podrás ingresar tus propios valores.",
        toggle: "Activar Seguimiento de Precios",
        btcPriceTrackerMode: "Modo de seguimiento de precio BTC",
        showRateNotifications: "Mostrar notificaciones de actualización de tipos de cambio",
        notificationsDescription:
          "Cuando está habilitado, recibirás una notificación cada vez que las tasas se actualicen automáticamente.",
      },
      persistentInput: {
        title: "Comportamiento de Entrada",
        label: "Mantener entrada al cambiar moneda",
        description: "El valor de entrada se mantiene al cambiar monedas, solo se borra con foco manual",
      },
      numberFormat: {
        title: "Formato de Números",
        useCommaAsDecimalSeparator: "Usar coma como separador decimal",
        includeThousandSeparatorsWhenCopying: "Incluir separadores de miles al copiar",
      },
      displayCurrencies: {
        title: "Mostrar Monedas",
        description:
          "Selecciona entre 2 y 6 monedas para mostrar en la pantalla principal. Arrástralas para cambiar el orden.",
        selected: "Monedas Seleccionadas",
        available: "Monedas Disponibles",
        dragToReorder: "Arrastra para reordenar",
      },
      about: {
        title: "Conoce Convy",
        description:
          "Tu conversor de divisas de Bitcoin rápido y centrado en la privacidad, y rastreador de precios en tiempo real. Todas las conversiones y actualizaciones se realizan al 100 % en tu dispositivo, manteniendo tus datos privados. Soy [Neo](neo), el creador, y diseño aplicaciones web nativas para personas amantes de la libertad que quieran liberarse de los jardines vallados de Apple y compañía.",
        checkOutMyApps: "Más apps de Neo21.dev",
      },
      shareableUrl: {
        title: "URL Compartible",
        description:
          "Comparte tu configuración personalizada de monedas con otros o guarda diferentes configuraciones para fácil acceso. La URL incluye tu moneda base seleccionada y las monedas mostradas, listadas en tu orden preferido.",
        placeholder: "Generando URL...",
        copyTitle: "Copiar URL",
        openTitle: "Abrir en nueva pestaña",
        howToUse: "Cómo usar:",
        step1: "Configura tu moneda base y monedas mostradas preferidas",
        step2: "Ordénalas como prefieras",
        step3: "Copia la URL de arriba para compartir tu configuración",
        step4: "Cualquiera que abra esta URL verá tu configuración exacta",
        copied: "URL Copiada",
        copyFailed: "Error al Copiar",
        copiedDescription: "URL compartible copiada al portapapeles",
        copyFailedDescription: "Error al copiar URL al portapapeles",
      },
    },
    converter: {
      title: "Conversor de Bitcoin",
      enterAmount: "Ingresa cantidad",
      lastUpdated: "Última actualización",
      gettingRates: "Obteniendo tasas...",
      loadingRates: "Cargando tasas de Bitcoin actuales...",
      tapToCopy: "Toca cualquier resultado para copiar",
      sourceCode: "código fuente",
      addToHomeScreen: "Añádeme a tu pantalla de inicio para una experiencia web fluida.",
      ratesFooter:
        "Toca cualquier resultado para copiarlo. Las cotizaciones son proporcionadas por CoinGecko. Todos los cálculos se realizan al 100 % sin conexión en tu dispositivo. Puedes revisar el código fuente para comprobarlo. Agrégame a tu pantalla de inicio para disfrutar de una experiencia web fluida.",
      ratesUpdated: {
        title: "Cotizaciones Actualizadas",
        description: "Se actualiza automáticamente cada 60 segundos cuando se detecta actividad.",
      },
    },
    donation: {
      button: "Envíame un café",
      title: "Apoya Este Proyecto",
      subtitle: "Envía una donación por Lightning de Bitcoin",
      generating: "Generando factura Lightning...",
      copied: "Copiado al portapapeles",
      description: "Elige una cantidad para enviar:",
      scanQR: "Escanea este código QR con tu billetera Lightning para pagar",
      copyInvoice: "Copiar Factura",
      thankYou: {
        title: "¡Gracias por tu donación!",
        subtitle: "Tu donación ayuda a mantener este proyecto",
      },
    },
    common: {
      dark: "Oscuro",
      light: "Claro",
    },
  },
  de: {
    settings: {
      title: "Einstellungen",
      appearance: "Erscheinungsbild",
      language: "Sprache",
      version: "Version",
      priceTracker: {
        title: "Preisverfolgung",
        description:
          "Ist die Funktion aktiviert, zeigt die App bei jedem Öffnen automatisch den aktuellen Wert von 1 BTC an, während du weiterhin eigene Werte eingeben kannst.",
        toggle: "Preisverfolgung aktivieren",
        btcPriceTrackerMode: "BTC-Preisverfolgungsmodus",
        showRateNotifications: "Benachrichtigungen zu Kurs-Updates anzeigen",
        notificationsDescription:
          "Wenn aktiviert, erhältst du eine Benachrichtigung, sobald die Kurse automatisch aktualisiert werden.",
      },
      persistentInput: {
        title: "Eingabeverhalten",
        label: "Eingabe bei Währungswechsel behalten",
        description: "Eingabewert bleibt beim Wechseln von Währungen, wird nur bei manuellem Fokus gelöscht",
      },
      numberFormat: {
        title: "Zahlenformat",
        useCommaAsDecimalSeparator: "Komma als Dezimaltrennzeichen verwenden",
        includeThousandSeparatorsWhenCopying: "Tausendertrennzeichen beim Kopieren einschließen",
      },
      displayCurrencies: {
        title: "Währungen anzeigen",
        description:
          "Wähle zwischen 2 und 6 Währungen, die auf dem Hauptbildschirm angezeigt werden sollen. Ziehe sie per Drag & Drop, um ihre Reihenfolge anzupassen.",
        selected: "Ausgewählte Währungen",
        available: "Verfügbare Währungen",
        dragToReorder: "Drag & Drop zum Neuordnen",
      },
      about: {
        title: "Lerne Convy kennen",
        description:
          "Deinen schnellen, datenschutz­orientierten Bitcoin-Währungs­umrechner und Echtzeit-Preis­tracker. Alle Umrechnungen und Updates laufen zu 100 % auf deinem Gerät – so bleiben deine Daten privat. Ich bin [Neo](neo), der Entwickler, und ich erstelle native Web‑Apps für freiheits­liebende Menschen, die den Walled Gardens von Apple & Co. entkommen wollen.",
        checkOutMyApps: "Mehr Apps von Neo21.dev",
      },
      shareableUrl: {
        title: "Teilbare URL",
        description:
          "Teile deine benutzerdefinierte Währungskonfiguration mit anderen oder speichere verschiedene Setups für einfachen Zugriff. Die URL enthält deine gewählte Basiswährung und Anzeigewährungen in deiner bevorzugten Reihenfolge.",
        placeholder: "URL wird generiert...",
        copyTitle: "URL kopieren",
        openTitle: "In neuem Tab öffnen",
        howToUse: "So verwenden:",
        step1: "Richte deine bevorzugte Basiswährung und Anzeigewährungen ein",
        step2: "Ordne sie in deiner gewünschten Reihenfolge an",
        step3: "Kopiere die URL oben, um deine Konfiguration zu teilen",
        step4: "Jeder, der diese URL öffnet, sieht dein exaktes Setup",
        copied: "URL Kopiert",
        copyFailed: "Kopieren Fehlgeschlagen",
        copiedDescription: "Teilbare URL in die Zwischenablage kopiert",
        copyFailedDescription: "Fehler beim Kopieren der URL in die Zwischenablage",
      },
    },
    converter: {
      title: "Bitcoin-Umrechner",
      enterAmount: "Betrag eingeben",
      lastUpdated: "Zuletzt aktualisiert",
      gettingRates: "Hole Kurse...",
      loadingRates: "Lade aktuelle Bitcoin-Kurse...",
      tapToCopy: "Tippe auf ein Ergebnis zum Kopieren",
      sourceCode: "Quellcode",
      addToHomeScreen: "Füge mich deinem Startbildschirm hinzu für ein nahtloses Web-App-Erlebnis.",
      ratesFooter:
        "Tippe auf ein Ergebnis, um es zu kopieren. Die Kurse werden von CoinGecko bereitgestellt. Alle Berechnungen erfolgen zu 100 % offline auf deinem Gerät. Du kannst den Quellcode jederzeit einsehen, um das zu verifizieren. Füge Convy App deinem Startbildschirm hinzu, um sie nahtlos wie eine native App zu nutzen.",
      ratesUpdated: {
        title: "Währungskurse Aktualisiert",
        description: "Automatische Aktualisierung alle 60 Sekunden bei erkannter Aktivität.",
      },
    },
    donation: {
      button: "Spendiere mir einen Kaffee",
      title: "Unterstütze dieses Projekt",
      subtitle: "Sende eine Bitcoin-Lightning-Spende",
      generating: "Lightning-Rechnung wird erstellt...",
      copied: "In die Zwischenablage kopiert",
      description: "Wähle einen Betrag zum Senden:",
      scanQR: "Scanne diesen QR-Code mit deiner Lightning Wallet um zu bezahlen",
      copyInvoice: "Rechnung kopieren",
      thankYou: {
        title: "Vielen Dank für deine Spende!",
        subtitle: "Deine Spende hilft, dieses Projekt am Laufen zu halten",
      },
    },
    common: {
      dark: "Dunkel",
      light: "Hell",
    },
  },
};
