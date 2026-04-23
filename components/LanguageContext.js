import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    home: 'Home',
    marketplace: 'Marketplace',
    pharmacy: 'Pharmacy',
    hotels: 'Hotels',
    tailor: 'Tailor',
    generalStore: 'General Store',
    courses: 'Courses',
    sell: 'Sell',
    contact: 'Contact',
    admin: 'Admin',
    search: 'Search',
    cart: 'Cart',
    profile: 'Profile',
    trending: 'Trending items',
    categories: 'Categories',
    mobilePhones: 'Mobile Phones',
    laptops: 'Laptops',
    electronics: 'Electronics',
    fashion: 'Fashion',
    vehicles: 'Vehicles',
    realEstate: 'Real Estate',
    homeAppliances: 'Home Appliances',
    services: 'Services',
    pharmacyDrugs: 'Pharmacy & Drugs',
    hotelFood: 'Hotel & Food',
    tailorClothing: 'Tailor & Clothing',
    generalStore: 'General Store',
    searchPlaceholder: 'Search for products, services, or courses...',
    startVoiceSearch: 'Start voice search',
    searchButton: 'Search',
    loading: 'Loading...',
    noProducts: 'No products found',
    sortByPrice: 'Sort by Price',
    sortByDate: 'Sort by Date',
    // Add more as needed
  },
  am: {
    home: 'መነሻ',
    marketplace: 'የገበያ ቦታ',
    pharmacy: 'የህክምና ቦታ',
    hotels: 'እንግዳዎች',
    tailor: 'የልብስ ሰሪ',
    generalStore: 'አጠቃላይ ሱቅ',
    courses: 'ኮርሶች',
    sell: 'ሽጥ',
    contact: 'ተገናኝ',
    admin: 'አስተያየት',
    search: 'ፈልግ',
    cart: 'ገበያ',
    profile: 'መገለጫ',
    trending: 'የሚለቀቁ እቃዎች',
    categories: 'ምድቦች',
    mobilePhones: 'ሞባይል ስልኮች',
    laptops: 'ላፕቶፖች',
    electronics: 'ኢሌክትሮኒክስ',
    fashion: 'ፋሽን',
    vehicles: 'ተሽከርካሪዎች',
    realEstate: 'የቤት ንግድ',
    homeAppliances: 'የቤት እቃዎች',
    services: 'አገልግሎቶች',
    pharmacyDrugs: 'የህክምና ቦታ እና መድሃኒቶች',
    hotelFood: 'እንግዳ እና ምግብ',
    tailorClothing: 'የልብስ ሰሪ እና ልብስ',
    generalStore: 'አጠቃላይ ሱቅ',
    searchPlaceholder: 'ለምርቶች፣ አገልግሎቶች ወይም ኮርሶች ፈልግ...',
    startVoiceSearch: 'የድምጽ ፍለጋ ጀምር',
    searchButton: 'ፈልግ',
    loading: 'በማስገባበጥ ላይ...',
    noProducts: 'ምርቶች አልተለቁም',
    sortByPrice: 'በዋጋ የሚለይ',
    sortByDate: 'በቀን የሚለይ',
  },
  om: {
    home: 'Mana',
    marketplace: 'Iddoo gabaa',
    pharmacy: 'Iddoo fayyaa',
    hotels: 'Hoteela',
    tailor: 'Sarartaa uffataa',
    generalStore: 'Iddoo gabaa guutuu',
    courses: 'Koorsoota',
    sell: 'Gurgur',
    contact: 'Qunnamtii',
    admin: 'Bulchiisa',
    search: 'Barbaaduu',
    cart: 'Gabaa',
    profile: 'Seenaa',
    trending: 'Meeshaalee walitti qabaman',
    categories: 'Ramaddiiwwan',
    mobilePhones: 'Bilbilaa mobaayilaa',
    laptops: 'Laaptopii',
    electronics: 'Eleektirooniksii',
    fashion: 'Faashinii',
    vehicles: 'Konkolaataa',
    realEstate: 'Qabeenya gurgurtaa',
    homeAppliances: 'Meeshaalee mana',
    services: 'Tajaajila',
    pharmacyDrugs: 'Iddoo fayyaa fi dhukkubsataa',
    hotelFood: 'Hoteela fi nyaata',
    tailorClothing: 'Sarartaa uffataa fi uffata',
    generalStore: 'Iddoo gabaa guutuu',
    searchPlaceholder: 'Meeshaalee, tajaajila ykn koorsoota barbaaduu...',
    startVoiceSearch: 'Barbaacha sagalee kaasi',
    searchButton: 'Barbaaduu',
    loading: 'Fe\'umsa keessaa...',
    noProducts: 'Meeshaalee hin argamne',
    sortByPrice: 'Gatii irraan qooddi',
    sortByDate: 'Guyyaa irraan qooddi',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}