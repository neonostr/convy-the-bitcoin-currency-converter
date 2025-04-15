
const DAILY_USAGE_KEY = 'bitcoin-converter-daily-usage';
const API_CALLS_KEY = 'bitcoin-converter-api-calls';

interface UsageStats {
  date: string;
  count: number;
  apiCalls: number;
}

export const trackAppUsage = () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Retrieve or initialize usage stats
  const storedStats = localStorage.getItem(DAILY_USAGE_KEY);
  const stats: UsageStats = storedStats 
    ? JSON.parse(storedStats) 
    : { date: today, count: 0, apiCalls: 0 };

  // If it's a new day, reset the count
  if (stats.date !== today) {
    stats.date = today;
    stats.count = 0;
    stats.apiCalls = 0;
  }

  // Increment usage count
  stats.count += 1;

  // Save back to localStorage
  localStorage.setItem(DAILY_USAGE_KEY, JSON.stringify(stats));

  return stats;
};

export const trackApiCall = () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Retrieve or initialize API call stats
  const storedStats = localStorage.getItem(API_CALLS_KEY);
  const stats: UsageStats = storedStats 
    ? JSON.parse(storedStats) 
    : { date: today, count: 0, apiCalls: 0 };

  // If it's a new day, reset the count
  if (stats.date !== today) {
    stats.date = today;
    stats.apiCalls = 0;
  }

  // Increment API call count
  stats.apiCalls += 1;

  // Save back to localStorage
  localStorage.setItem(API_CALLS_KEY, JSON.stringify(stats));

  return stats;
};

export const getDailyUsageStats = (): UsageStats => {
  const storedStats = localStorage.getItem(DAILY_USAGE_KEY);
  return storedStats ? JSON.parse(storedStats) : { date: '', count: 0, apiCalls: 0 };
};
