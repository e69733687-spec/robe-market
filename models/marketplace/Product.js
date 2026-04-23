import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }], // Array of image URLs
  condition: { type: String, enum: ['New', 'Used', 'Refurbished'], default: 'Used' },
  location: { type: String, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, default: 1 },
  verified: { type: Boolean, default: false },
  ratings: [{ type: Number, min: 1, max: 5 }],
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ProductSchema.index({ category: 1, location: 1, seller: 1, createdAt: -1 });
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);