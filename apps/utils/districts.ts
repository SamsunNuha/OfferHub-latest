export interface DistrictCoordinates {
  latitude: DoubleRange | number;
  longitude: DoubleRange | number;
}

export const DISTRICT_CENTERS: Record<string, { latitude: number; longitude: number }> = {
  "Colombo": { latitude: 6.9271, longitude: 79.8612 },
  "Gampaha": { latitude: 7.0873, longitude: 80.0144 },
  "Kalutara": { latitude: 6.5854, longitude: 79.9607 },
  "Kandy": { latitude: 7.2906, longitude: 80.6337 },
  "Galle": { latitude: 6.0535, longitude: 80.2210 },
  "Matara": { latitude: 5.9549, longitude: 80.5550 },
  "Jaffna": { latitude: 9.6615, longitude: 80.0255 },
  "Kurunegala": { latitude: 7.4863, longitude: 80.3647 },
  "Anuradhapura": { latitude: 8.3114, longitude: 80.4037 },
  "Badulla": { latitude: 6.9934, longitude: 81.0550 },
  "Ratnapura": { latitude: 6.6828, longitude: 80.3992 },
  "Trincomalee": { latitude: 8.5775, longitude: 81.2335 },
  "Batticaloa": { latitude: 7.7171, longitude: 81.7010 },
  "Ampara": { latitude: 7.2955, longitude: 81.6747 },
  "Polonnaruwa": { latitude: 7.9403, longitude: 81.0028 },
  "Puttalam": { latitude: 8.0330, longitude: 79.8277 },
  "Moneragala": { latitude: 6.8724, longitude: 81.3507 },
  "Nuwara Eliya": { latitude: 6.9497, longitude: 80.7891 },
  "Hambantota": { latitude: 6.1246, longitude: 81.1185 },
  "Mullaitivu": { latitude: 9.2671, longitude: 80.8142 },
  "Kilinochchi": { latitude: 9.3803, longitude: 80.3992 },
  "Mannar": { latitude: 8.9810, longitude: 79.9044 },
  "Vavuniya": { latitude: 8.7542, longitude: 80.4982 },
  "Kegalle": { latitude: 7.2513, longitude: 80.3464 },
  "Matale": { latitude: 7.4675, longitude: 80.6234 }
};

export const DISTRICT_LIST = Object.keys(DISTRICT_CENTERS).sort();

export interface MapLocation {
  id: string;
  name: string;
  category: string; // "Electronics" | "Fashion" | "Grocery" | "Restaurants" | "Pharmacy" etc.
  latitude: number;
  longitude: number;
  district: string;
  address: string;
  contact: string;
  rating: number;
  offers: string[];
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function scatterLocations(district: string): MapLocation[] {
  const center = DISTRICT_CENTERS[district] || DISTRICT_CENTERS.Colombo;
  const { latitude: lat, longitude: lon } = center;
  
  return [
    {
      id: `${district}_keells`,
      name: `Keells Super Store - ${district} Central`,
      category: "Grocery",
      latitude: lat + 0.0035,
      longitude: lon - 0.0028,
      district,
      address: `No. 112, Galle Road, ${district}`,
      contact: "+94 11 254 9901",
      rating: 4.7,
      offers: ["20% OFF on Fruits & Vegies", "🔥 Hot Offer", "🎁 Coupon"]
    },
    {
      id: `${district}_singer`,
      name: `Singer Mega Showroom - ${district} East`,
      category: "Electronics",
      latitude: lat - 0.0042,
      longitude: lon + 0.0031,
      district,
      address: `No. 45, Main Street, ${district}`,
      contact: "+94 11 289 1234",
      rating: 4.6,
      offers: ["Up to 30% OFF On Selected Electronics", "💳 Card Discount"]
    },
    {
      id: `${district}_odel`,
      name: `Odel Retail Outlet - ${district} Mall`,
      category: "Fashion",
      latitude: lat + 0.0012,
      longitude: lon + 0.0055,
      district,
      address: `Level 2, Premium Arcade Center, ${district}`,
      contact: "+94 11 230 4567",
      rating: 4.8,
      offers: ["20% OFF On Fashion & Accessories", "👗 Summer Dress Sale"]
    },
    {
      id: `${district}_pizza_hut`,
      name: `Pizza Hut - ${district} Express`,
      category: "Restaurants",
      latitude: lat - 0.0025,
      longitude: lon - 0.0048,
      district,
      address: `No. 77, Kandy Road, ${district}`,
      contact: "+94 11 272 9729",
      rating: 4.5,
      offers: ["Buy 1 Get 1 Free - Premium Pizza Range", "🍕 Lunch Promo"]
    },
    {
      id: `${district}_ceylon_pharmacy`,
      name: `Ceylon Pharmacy - ${district} Health`,
      category: "Pharmacy",
      latitude: lat + 0.0051,
      longitude: lon - 0.0012,
      district,
      address: `No. 19, Temple Road, ${district}`,
      contact: "+94 11 210 2030",
      rating: 4.4,
      offers: ["10% Off All Wellness Products", "💊 Health Shield"]
    }
  ];
}
