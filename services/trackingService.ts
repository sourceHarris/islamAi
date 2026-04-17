import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  isCustom: boolean;
}

export interface QuranTracking {
  read: boolean;
  listened: boolean;
  minutes: number;
}

export interface DailyChecklist {
  date: string; // YYYY-MM-DD
  prayers: ChecklistItem[];
  quranTracking: QuranTracking;
  dhikr: ChecklistItem[];
  customPractices: ChecklistItem[];
  reflection: string;
}

const TRACKING_KEY = '@spiritual_tracking_data';

// Helper to get today's date string
export const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getDefaultPrayers = (): ChecklistItem[] => [
  { id: 'fajr', title: 'Fajr', completed: false, isCustom: false },
  { id: 'dhuhr', title: 'Dhuhr', completed: false, isCustom: false },
  { id: 'asr', title: 'Asr', completed: false, isCustom: false },
  { id: 'maghrib', title: 'Maghrib', completed: false, isCustom: false },
  { id: 'isha', title: 'Isha', completed: false, isCustom: false },
];

export const getDefaultDhikr = (): ChecklistItem[] => [
  { id: 'morning', title: 'Morning Adhkar', completed: false, isCustom: false },
  { id: 'evening', title: 'Evening Adhkar', completed: false, isCustom: false },
];

// Load all historical data
export const loadAllData = async (): Promise<Record<string, DailyChecklist>> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRACKING_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    console.error('Error loading tracking data', e);
    return {};
  }
};

// Load today's checklist
export const loadTodayChecklist = async (): Promise<DailyChecklist> => {
  const allData = await loadAllData();
  const today = getTodayDateString();
  
  if (allData[today]) {
    return allData[today];
  }
  
  return {
    date: today,
    prayers: getDefaultPrayers(),
    quranTracking: { read: false, listened: false, minutes: 0 },
    dhikr: getDefaultDhikr(),
    customPractices: [],
    reflection: '',
  };
};

// Save today's checklist
export const saveTodayChecklist = async (checklist: DailyChecklist) => {
  try {
    const allData = await loadAllData();
    allData[checklist.date] = checklist;
    await AsyncStorage.setItem(TRACKING_KEY, JSON.stringify(allData));
  } catch (e) {
    console.error('Error saving tracking data', e);
  }
};

// --- Analytics & Streaks ---

export const calculateStreaks = async () => {
  const allData = await loadAllData();
  
  let prayerStreak = 0;
  let quranStreak = 0;
  
  const today = getTodayDateString();
  let checkDate = new Date(today);
  
  // Calculate prayer streak (all 5 prayers must be done)
  for (let i = 0; i < 365; i++) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const dayData = allData[dStr];
    
    if (!dayData) {
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue; // missed today is okay until end of day
      }
      break; 
    }
    
    // Check if all 5 prayers completed
    const allPrayersDone = dayData.prayers.filter(p => !p.isCustom && p.completed).length === 5;
    if (allPrayersDone) {
      prayerStreak++;
    } else if (i !== 0) {
      break; 
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  checkDate = new Date(today);
  // Calculate Quran streak
  for (let i = 0; i < 365; i++) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const dayData = allData[dStr];
    
    if (!dayData) {
      if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
    
    if (dayData.quranTracking.read || dayData.quranTracking.listened) {
      quranStreak++;
    } else if (i !== 0) {
      break; 
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return { prayerStreak, quranStreak };
};

export const getWeeklyInsights = async () => {
  const allData = await loadAllData();
  const dates = Object.keys(allData).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).slice(0, 7);
  
  let prayersDone = 0;
  dates.forEach(d => {
    prayersDone += allData[d].prayers.filter(p => !p.isCustom && p.completed).length;
  });
  
  return {
    prayersCompleted: prayersDone,
    totalPrayers: dates.length * 5 || 35,
    daysActive: dates.length,
  };
};

export const getHeatmapData = async () => {
  const allData = await loadAllData();
  const days = [];
  const checkDate = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    const dayData = allData[dStr];
    
    let intensity = 0;
    if (dayData) {
      const prayersDone = dayData.prayers.filter(p => !p.isCustom && p.completed).length;
      if (prayersDone >= 1) intensity += 1;
      if (prayersDone === 5) intensity += 1;
      if (dayData.quranTracking.read || dayData.quranTracking.listened) intensity += 1;
      if (dayData.dhikr.some(d => d.completed)) intensity += 1;
    }
    
    days.push({ day: 29 - i, intensity });
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return days.reverse();
};

export const getPrayerAnalytics = async () => {
  const allData = await loadAllData();
  const dates = Object.keys(allData).slice(-30);
  
  const counts: Record<string, number> = { fajr: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 };
  
  if (dates.length === 0) {
    return [
      { name: 'Fajr', completion: 0, color: '#8b5cf6' },
      { name: 'Dhuhr', completion: 0, color: '#10b981' },
      { name: 'Asr', completion: 0, color: '#3b82f6' },
      { name: 'Maghrib', completion: 0, color: '#f59e0b' },
      { name: 'Isha', completion: 0, color: '#ef4444' },
    ];
  }
  
  dates.forEach(d => {
    const day = allData[d];
    day.prayers.forEach(p => {
      if (!p.isCustom && p.completed) {
        counts[p.id] = (counts[p.id] || 0) + 1;
      }
    });
  });
  
  return [
    { name: 'Fajr', completion: Math.round((counts.fajr / dates.length) * 100), color: '#8b5cf6' },
    { name: 'Dhuhr', completion: Math.round((counts.dhuhr / dates.length) * 100), color: '#10b981' },
    { name: 'Asr', completion: Math.round((counts.asr / dates.length) * 100), color: '#3b82f6' },
    { name: 'Maghrib', completion: Math.round((counts.maghrib / dates.length) * 100), color: '#f59e0b' },
    { name: 'Isha', completion: Math.round((counts.isha / dates.length) * 100), color: '#ef4444' },
  ];
};
