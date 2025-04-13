
# Convy - The Bitcoin Currency Converter

A privacy-focused, open-source Bitcoin currency converter that works offline and respects your privacy.

## Features

- **Privacy First**: All calculations are performed locally in your browser. No tracking, no analytics, no data collection.
- **Offline Support**: Works without an internet connection after the first load.
- **Multiple Currencies**: Convert between BTC, satoshis, USD, EUR, CHF, and CNY.
- **Real-time Rates**: Fetch the latest exchange rates from CoinGecko (when online).
- **Mobile Friendly**: Responsive design works great on all devices.
- **Dark Mode**: Easy on the eyes with a toggleable dark mode.
- **Open Source**: Free and open-source software (FOSS) you can verify and trust.
- **PWA Support**: Install as a Progressive Web App on your device.

## How to Use

1. Enter an amount in the input field.
2. Select your base currency (BTC, sats, USD, EUR, CHF, CNY).
3. View the conversions to all other currencies instantly.
4. Tap any result to copy just the numeric value to your clipboard.
5. Rates auto-update every 60 seconds with user activity.

## Privacy

This app is designed with privacy in mind:

- No server-side tracking or analytics
- No cookies
- No user data collection
- All calculations are performed locally in your browser
- Exchange rates are fetched anonymously when online
- Works offline after initial load

## For Developers

This project is hosted at: https://github.com/neonostr/convy-the-bitcoin-currency-converter

This project is built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components

### Running Locally

```sh
# Clone the repository
git clone https://github.com/neonostr/convy-the-bitcoin-currency-converter.git

# Navigate to the project directory
cd convy-the-bitcoin-currency-converter

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```sh
npm run build
```

The built files will be in the `dist` folder and can be served by any static web server.

## Support This Project

If you find this tool useful, consider supporting further development:

<a href="https://zapmeacoffee.com/neo-nostrpurple-com" target="_blank" style="background-color:#f97316;color:white;padding:10px 20px;border-radius:9999px;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;display:inline-flex;align-items:center;font-weight:500;"><svg style="width:16px;height:16px;margin-right:6px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>Zap me a coffee</a>

## License

MIT License - Feel free to use, modify, and distribute as you see fit.
