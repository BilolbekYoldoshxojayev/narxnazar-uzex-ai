export type ProductCategory = 
  | "Qurilish materiallari" 
  | "Qishloq xo'jaligi va oziq-ovqat" 
  | "Yoqilg'i" 
  | "Kimyoviy moddalar" 
  | "Boshqa"
  | "Qurilish mollari" 
  | "Oziq-ovqat";

export type TrendDirection = "tushish" | "ko'tarilish" | "barqaror";
export type DecisionAction = "sotib_oling" | "kuting" | "savdolashing" | "alternativ_qidiring";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: string;
  unit: string;
  benchmark_price: number;
  min_price: number;
  max_price: number;
  change_pct: number;
  forecast_trend: TrendDirection;
  recommendation: DecisionAction;
  recommendation_reason: string;
  confidence_score: number;
  specifications: Record<string, string>;
  image_url?: string;
  last_updated: string;
}

export interface PricePoint {
  date: string;
  price: number;
  market_name?: string;
  region?: string;
  is_forecast?: boolean;
  forecast_min?: number;
  forecast_max?: number;
}

export interface RegionalPrice {
  region: string;
  market_name: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  stock_status: "yetarli" | "o'rtacha" | "kam";
  verified_deals: number;
}

export interface Supplier {
  id: string;
  name: string;
  category: ProductCategory;
  region: string;
  address: string;
  phone: string;
  rating: number;
  verified: boolean;
  min_order_qty: number;
  unit: string;
  unit_price: number;
  delivery_terms: string;
  payment_terms: string;
  response_time: string;
  deals_count: number;
  sponsored?: boolean;
}

export interface RfqRequest {
  id?: string;
  product_id: string;
  product_name: string;
  supplier_id?: string;
  supplier_name?: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_organization?: string;
  quantity: number;
  unit: string;
  delivery_address: string;
  target_price?: number;
  notes?: string;
  status: "yangi" | "ko'rib_chiqilmoqda" | "tasdiqlandi";
  created_at?: string;
}

export interface LandedCostInput {
  volume: number;
  purchase_price: number;
  transport_cost: number;
  customs_or_tax: number;
  other_expenses: number;
  target_sale_price: number;
}

export interface LandedCostResult {
  totalPurchase: number;
  totalExpenses: number;
  totalLandedCost: number;
  costPerUnit: number;
  targetSalePrice: number;
  totalRevenue: number;
  grossProfit: number;
  marginPct: number;
  roiPct: number;
  breakEvenUnits: number;
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
}

export interface ScannedInvoiceItem {
  name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  category_guess?: string;
}

export interface ScannedInvoiceResult {
  supplier_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  currency: string;
  items: ScannedInvoiceItem[];
  total_amount: number;
  confidence: number;
}
