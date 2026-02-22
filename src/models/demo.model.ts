import mongoose, { Document, Schema, Model } from 'mongoose';

// Interfaces
export interface IImage extends Document {
  url: string;
}

export interface IProductPrice extends Document {
  currency: string;
  price: number;
  discount: number;
  finalPrice: number;
}

export interface IColorImage extends Document {
  colorName: string;
  imageUrl: string;
  productImageUrl: IImage[];
  productGallery: IImage[];
  colorPrice: IProductPrice[];
  stock: number;
}

export interface IProductModelDetails {
  colors: IColorImage[];
  specifications: { points: string }[];
  productSpecifications: { key: string; value: string }[];
  productFeatures: { key: string; value: string }[];
  productFeaturesIcons: string[];
  standardParameters: { iconName: string }[];
  optionalParameters: { iconName: string }[];
  warranty: { points: string }[];
  scheme: IProductSell;
}

export interface IProductSell extends Document {
  saleProduct: boolean;
  tradingProduct: boolean;
  companyProduct: boolean;
  valuableProduct: boolean;
  recommendedProduct: boolean;
}

export interface IModel extends Document {
  modelName: string;
  status: 'Padding' | 'Live' | 'Enquiry';
  productModelDetails: IProductModelDetails | null;
}

export interface IDemo extends Document {
  productCategory: string;
  productTitle: string;
  description?: string;
  productModels: IModel[];
}

// Schemas
const ImageSchema: Schema<IImage> = new Schema({
  url: { type: String, required: true, trim: true },
});

const ProductPriceSchema: Schema<IProductPrice> = new Schema({
  currency: { type: String, default: 'INR', uppercase: true },
  price: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  finalPrice: { type: Number, min: 0 },
});

ProductPriceSchema.pre<IProductPrice>('save', function () {
  if (this.price != null) {
    this.finalPrice = this.price - Math.round((this.price * (this.discount || 0)) / 100);
  }
});

const ColorImageSchema: Schema<IColorImage> = new Schema({
  colorName: { type: String, required: true, trim: true, default: '' },
  imageUrl: { type: String, required: true, default: '' },
  productImageUrl: { type: [ImageSchema], default: [] },
  productGallery: { type: [ImageSchema], default: [] },
  colorPrice: { type: [ProductPriceSchema], default: [] },
  stock: { type: Number, default: 0, min: 0 },
});

const ProductModelDetailsSchema: Schema<IProductModelDetails> = new Schema({
  colors: { type: [ColorImageSchema], default: [] },
  specifications: { type: [{ points: String }], default: [] },
  productSpecifications: [{ key: String, value: String }],
  productFeatures: [{ key: String, value: String }],
  productFeaturesIcons: { type: [String], default: [] },
  standardParameters: [{ iconName: { type: String, enum: ['ECG', 'RESPIRATION', 'SPO2', 'NIBP', 'TEMP', 'PR'] } }],
  optionalParameters: [{ iconName: { type: String, enum: ['ETCO2', 'IBP'] } }],
  warranty: { type: [{ points: String }], default: [] },
  scheme: { type: Object, default: {} },
});

const ModelSchema: Schema<IModel> = new Schema({
  modelName: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Padding', 'Live', 'Enquiry'], default: 'Padding' },
  productModelDetails: { type: ProductModelDetailsSchema, default: null, required: false },
});

const ProductSchema: Schema<IDemo> = new Schema(
  {
    productCategory: { type: String, required: true },
    productTitle: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    productModels: { type: [ModelSchema], default: [] },
  },
  { timestamps: true }
);

const Demo: Model<IDemo> = mongoose.models.Demo || mongoose.model<IDemo>('Demo', ProductSchema);

export default Demo;
