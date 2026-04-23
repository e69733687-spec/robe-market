const products = [
  // Electronics
  {
    id: '1',
    name: 'Samsung Galaxy S25 Ultra',
    category: 'Mobile Phones',
    description: 'Brand new Samsung flagship with 512GB storage and 108MP camera.',
    price: 175000,
    stock: 5,
    condition: 'New',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    verified: true,
    ratings: [5, 4, 5]
  },
  {
    id: '2',
    name: 'HP Pavilion Gaming Laptop',
    category: 'Laptops',
    description: 'Intel Core i7, 16GB RAM, 512GB SSD, perfect for work and gaming.',
    price: 93000,
    stock: 3,
    condition: 'Used',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    verified: false,
    ratings: [4, 5]
  },
  {
    id: '3',
    name: '55" Smart LED TV',
    category: 'Television',
    description: 'New smart TV with HDR and streaming apps, great for living room entertainment.',
    price: 55000,
    stock: 6,
    condition: 'New',
    location: 'Bahir Dar',
    image: 'https://images.unsplash.com/photo-1508896694512-0c219b7ca10c?auto=format&fit=crop&w=900&q=80',
    verified: true
  },
  // Vehicles
  {
    id: '4',
    name: 'Toyota Corolla 2018',
    category: 'Cars for Sale',
    description: 'Well-maintained sedan with low mileage, perfect for city driving.',
    price: 850000,
    stock: 1,
    condition: 'Used',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
    verified: true
  },
  {
    id: '5',
    name: 'Yamaha Motorcycle',
    category: 'Motorbikes',
    description: 'Reliable motorbike for daily commute, in excellent condition.',
    price: 125000,
    stock: 2,
    condition: 'Used',
    location: 'Adama',
    image: 'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?auto=format&fit=crop&w=900&q=80',
    verified: false
  },
  // Real Estate
  {
    id: '6',
    name: '3-Bedroom Apartment',
    category: 'Apartments & Houses for Sale',
    description: 'Spacious apartment in a secure building with modern amenities.',
    price: 3500000,
    stock: 1,
    condition: 'New',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    verified: true
  },
  {
    id: '7',
    name: 'Commercial Shop for Rent',
    category: 'Shop & Office for Rent',
    description: 'Prime location shop space available for retail or office use.',
    price: 15000,
    stock: 1,
    condition: 'Available',
    location: 'Dire Dawa',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    verified: false
  },
  // Fashion
  {
    id: '8',
    name: 'Traditional Robe',
    category: 'Fashion',
    description: 'Authentic Ethiopian robe made with local fabrics.',
    price: 8500,
    stock: 14,
    condition: 'New',
    location: 'Robe',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80',
    verified: true
  },
  // Home Appliances
  {
    id: '9',
    name: 'Refrigerator and Freezer',
    category: 'Freezers and Fridges',
    description: 'Double-door refrigerator with strong cooling for family use.',
    price: 42000,
    stock: 4,
    condition: 'Used',
    location: 'Dire Dawa',
    image: 'https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?auto=format&fit=crop&w=900&q=80',
    verified: false
  },
  // Services
  {
    id: '10',
    name: 'Mobile Phone Repair',
    category: 'Computer & Information Technology',
    description: 'Fast and reliable phone repair service with genuine parts.',
    price: 500,
    stock: 25,
    condition: 'Service',
    location: 'Robe',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    verified: true
  },
  // Food & Health
  {
    id: '11',
    name: 'Coffee Gift Set',
    category: 'Food, Drinks & Health',
    description: 'Premium Ethiopian coffee set for home or gifting.',
    price: 1200,
    stock: 18,
    condition: 'New',
    location: 'Robe',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=900&q=80',
    verified: false
  },
  // Construction
  {
    id: '12',
    name: 'Generator 5KVA',
    category: 'Generator & Pumps',
    description: 'Reliable generator for backup power in homes or offices.',
    price: 75000,
    stock: 3,
    condition: 'New',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&w=900&q=80',
    verified: true
  },
  // Leisure
  {
    id: '13',
    name: 'Gaming Chair',
    category: 'Leisure, Sports & Outdoors',
    description: 'Comfortable ergonomic chair for gaming and work.',
    price: 9200,
    stock: 10,
    condition: 'New',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1580887411967-43b3a2a39c05?auto=format&fit=crop&w=900&q=80',
    verified: false
  },
  // Other
  {
    id: '14',
    name: 'Wanted: Laptop',
    category: 'Wanted / Lost & Found',
    description: 'Looking for a budget laptop for school use.',
    price: 0,
    stock: 1,
    condition: 'Wanted',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    verified: false
  }
];

const categories = [
  'Electronics',
  'Mobile Phones',
  'Laptops',
  'Television',
  'Vehicles & Accessories',
  'Cars for Sale',
  'Motorbikes',
  'Cars for Rent',
  'Real Estate Properties',
  'Apartments & Houses for Sale',
  'Apartments & Houses for Rent',
  'Shop & Office for Sale',
  'Fashion',
  'Men\'s Shoes',
  'Wrist watch',
  'Beauty Care Products',
  'Furniture, Home Decor & Appliances',
  'Freezers and Fridges',
  'Stoves, Ovens & Cookers',
  'Washing Machines & Dryers',
  'Construction, Machinery & Equipment',
  'Machinery',
  'Generator & Pumps',
  'Doors',
  'Food, Drinks & Health',
  'Supplements',
  'Body Building',
  'Spices & Herbs',
  'Leisure, Sports & Outdoors',
  'Exercise and Fitness Equipment',
  'Other Sporting Equipment',
  'Shoes',
  'Services',
  'Online Services',
  'Health & Beauty',
  'Computer & Information Technology',
  'Other Items',
  'Shares & Stock',
  'Toys',
  'Books',
  'Wanted / Lost & Found',
  'Wanted',
  'Lost and Found'
];

const users = [
  { id: 'u1', name: 'Local Buyer', email: 'user@robe.local', password: 'password123' }
];

const orders = [];

const analytics = {
  visits: 0,
  successfulPayments: 0
};

module.exports = { products, categories, users, orders, analytics };
