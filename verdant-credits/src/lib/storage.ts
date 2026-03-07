// LocalStorage helpers for carbon credit platform

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  npk: { n: number; p: number; k: number };
  farmSize: number; // in acres
  lat: number;
  lng: number;
  carbonCredits: number; // credits per year
  uniqueId: string;
  listed: boolean;
  sold: boolean;
  createdAt: string;
  certificateIssuedAt?: string;
}

export interface Certificate {
  farmerName: string;
  uniqueId: string;
  carbonCredits: number;
  issuedAt: string;
  farmSize: number;
  location: { lat: number; lng: number };
}

export interface Buyer {
  companyName: string;
  phone: string;
  password: string;
}

export interface Purchase {
  id: string;
  buyerPhone: string;
  farmerIds: string[];
  totalCredits: number;
  totalCost: number;
  date: string;
}

const FARMERS_KEY = "cc_farmers";
const BUYERS_KEY = "cc_buyers";
const PURCHASES_KEY = "cc_purchases";
const CURRENT_FARMER_KEY = "cc_current_farmer";
const CURRENT_FARMER_ID_KEY = "cc_current_farmer_id";
const CURRENT_BUYER_KEY = "cc_current_buyer";

// Farmers
export const getFarmers = (): Farmer[] => JSON.parse(localStorage.getItem(FARMERS_KEY) || "[]");
export const saveFarmer = (farmer: Farmer) => {
  const farmers = getFarmers();
  const idx = farmers.findIndex(f => f.id === farmer.id);
  if (idx >= 0) farmers[idx] = farmer;
  else farmers.push(farmer);
  localStorage.setItem(FARMERS_KEY, JSON.stringify(farmers));
};
export const getListedFarmers = (): Farmer[] => getFarmers().filter(f => f.listed && !f.sold);

// Buyers
export const getBuyers = (): Buyer[] => JSON.parse(localStorage.getItem(BUYERS_KEY) || "[]");
export const saveBuyer = (buyer: Buyer) => {
  const buyers = getBuyers();
  if (!buyers.find(b => b.phone === buyer.phone)) buyers.push(buyer);
  localStorage.setItem(BUYERS_KEY, JSON.stringify(buyers));
};
export const findBuyer = (phone: string, password: string): Buyer | undefined =>
  getBuyers().find(b => b.phone === phone && b.password === password);

// Purchases
export const getPurchases = (): Purchase[] => JSON.parse(localStorage.getItem(PURCHASES_KEY) || "[]");
export const savePurchase = (purchase: Purchase) => {
  const purchases = getPurchases();
  purchases.push(purchase);
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
};

// Session
export const setCurrentFarmer = (phone: string) => localStorage.setItem(CURRENT_FARMER_KEY, phone);
export const getCurrentFarmer = (): string | null => localStorage.getItem(CURRENT_FARMER_KEY);
export const setCurrentFarmerId = (id: string) => localStorage.setItem(CURRENT_FARMER_ID_KEY, id);
export const getCurrentFarmerId = (): string | null => localStorage.getItem(CURRENT_FARMER_ID_KEY);
export const setCurrentBuyer = (phone: string) => localStorage.setItem(CURRENT_BUYER_KEY, phone);
export const getCurrentBuyer = (): string | null => localStorage.getItem(CURRENT_BUYER_KEY);
export const logout = () => {
  localStorage.removeItem(CURRENT_FARMER_KEY);
  localStorage.removeItem(CURRENT_FARMER_ID_KEY);
  localStorage.removeItem(CURRENT_BUYER_KEY);
};

// Carbon credit calculation
export const calculateCarbonCredits = (npk: { n: number; p: number; k: number }, farmSize: number): number => {
  // Simplified formula: Based on soil health (NPK balance) and farm size
  const nScore = Math.min(npk.n / 50, 1) * 30;
  const pScore = Math.min(npk.p / 30, 1) * 25;
  const kScore = Math.min(npk.k / 40, 1) * 25;
  const soilHealth = nScore + pScore + kScore; // max 80
  const baseCredits = farmSize * 2.5; // 2.5 credits per acre base
  const credits = Math.round(baseCredits * (soilHealth / 80) * 10) / 10;
  return Math.max(credits, 0.1);
};

// Generate unique ID based on lat/lng
export const generateUniqueId = (lat: number, lng: number): string => {
  const latCode = Math.abs(Math.round(lat * 1000)).toString(36).toUpperCase();
  const lngCode = Math.abs(Math.round(lng * 1000)).toString(36).toUpperCase();
  return `CC-${latCode}-${lngCode}`;
};

// Certificate generation
export const generateCertificate = (farmer: Farmer): Certificate => {
  return {
    farmerName: farmer.name,
    uniqueId: farmer.uniqueId,
    carbonCredits: farmer.carbonCredits,
    issuedAt: new Date().toISOString(),
    farmSize: farmer.farmSize,
    location: { lat: farmer.lat, lng: farmer.lng },
  };
};

// Market price simulation
export const getMarketPrice = (): number => {
  const base = 1200; // INR per credit
  const variation = Math.sin(Date.now() / 100000) * 150 + Math.random() * 50;
  return Math.round((base + variation) * 100) / 100;
};

export const generatePriceHistory = (hours: number = 24): { time: string; price: number }[] => {
  const data: { time: string; price: number }[] = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const t = now - i * 3600000;
    const base = 1200;
    const variation = Math.sin(t / 100000) * 150 + Math.cos(t / 50000) * 80;
    data.push({
      time: new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      price: Math.round((base + variation) * 100) / 100,
    });
  }
  return data;
};
