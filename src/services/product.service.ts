import { Types } from 'mongoose';
import Demo, { IDemo, IModel, IProductModelDetails } from '../models/demo.model';
import dbConnect from '../lib/db';

interface CreateProductStep1Data {
  productCategory: string;
  productTitle: string;
  modelName: string;
}

export const createProductStep1Service = async (
  data: CreateProductStep1Data
): Promise<IDemo> => {
  await dbConnect();

  const product = await Demo.create({
    productCategory: data.productCategory,
    productTitle: data.productTitle,
    productModels: [
      {
        modelName: data.modelName,
        status: 'Padding',
        productModelDetails: null,
      },
    ],
  });

  return product;
};

interface AddProductModelData {
    modelName: string;
    status?: 'Padding' | 'Live';
}

export const addProductModelService = async (
    productId: string,
    modelData: AddProductModelData
): Promise<IModel> => {
    await dbConnect();

    const product = await Demo.findById(productId);

    if (!product) {
        throw new Error('Product not found');
    }

    const exists = product.productModels.some(
        (m) => m.modelName.toLowerCase() === modelData.modelName.toLowerCase()
    );

    if (exists) {
        throw new Error('Model with this name already exists');
    }

    const newModel = {
        modelName: modelData.modelName,
        status: modelData.status || 'Padding',
        productModelDetails: null,
    };

    product.productModels.push(newModel as IModel);

    await product.save();

    return product.productModels[product.productModels.length - 1];
};

export const addProductModelDetailsService = async (
  productId: string,
  modelId: string,
  modelDetails: IProductModelDetails
): Promise<IModel> => {
  await dbConnect();

  const product = await Demo.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const model = (product.productModels as any).id(modelId);
  if (!model) {
    throw new Error('Model not found');
  }

  model.productModelDetails = modelDetails;

  await product.save();
  return model;
};

interface ProductWithModelInfo {
    productId: string;
    productTitle: string;
    productDescription?: string;
    productCategory: string;
    modelId: string;
    modelName: string;
    status: 'Padding' | 'Live' | 'Enquiry';
    productModelDetails: IProductModelDetails | null;
  }

  export const getAllModelsWithProductInfoService = async (): Promise<ProductWithModelInfo[]> => {
    await dbConnect();
    const products = await Demo.find(
      {},
      {
        productTitle: 1,
        productCategory: 1,
        productModels: 1,
        description :1,
      }
    ).lean();

    const result: ProductWithModelInfo[] = [];

    for (const product of products) {
      for (const model of product.productModels) {
        // Only include models with status "Live"
        if (model.status === "Live") {
          result.push({
            productId: product._id.toString(),
            productTitle: product.productTitle,
            productDescription: product.description,
            productCategory: product.productCategory,
            modelId: model._id.toString(),
            modelName: model.modelName,
            status: model.status,
            productModelDetails: model.productModelDetails || null,
          });
        }
      }
    }

    return result;
  };

  export const getPaddingModelsService = async (): Promise<ProductWithModelInfo[]> => {
    await dbConnect();
    const products = await Demo.find(
      {},
      {
        productTitle: 1,
        productCategory: 1,
        productModels: 1,
      }
    ).lean();
  
    const result: ProductWithModelInfo[] = [];
  
    for (const product of products) {
      for (const model of product.productModels) {
        const allowedStatuses = ["Padding", "Enquiry"];
  
        if (allowedStatuses.includes(model.status)) {
          result.push({
            productId: product._id.toString(),
            productTitle: product.productTitle,
            productCategory: product.productCategory,
            modelId: model._id.toString(),
            modelName: model.modelName,
            status: model.status,
            productModelDetails: model.productModelDetails || null,
          });
        }
      }
    }
  
    return result;
  };
  
  export const getProductSellService = async (): Promise<ProductWithModelInfo[]> => {
    await dbConnect();
    const products = await Demo.find(
      {},
      {
        productTitle: 1,
        productCategory: 1,
        productModels: 1,
      }
    ).lean();
  
    const result: ProductWithModelInfo[] = [];
  
    for (const product of products) {
      for (const model of product.productModels) {
        // Only include models with status "Live" and saleProduct is true
        if (model.status === "Live" && model.productModelDetails?.scheme?.saleProduct === true) {
          result.push({
            productId: product._id.toString(),
            productTitle: product.productTitle,
            productCategory: product.productCategory,
            modelId: model._id.toString(),
            modelName: model.modelName,
            status: model.status,
            productModelDetails: model.productModelDetails || null,
          });
        }
      }
    }
  
    return result;
  };
  
  export const getProductByModelIdService = async (modelId: string): Promise<any> => {
    await dbConnect();
    const product = await Demo.findOne(
      { "productModels._id": modelId },
      { productTitle: 1, description: 1, productModels: 1 }
    ).lean();
  
    if (!product) return null;
  
    // Find the specific model details
    const model = product.productModels.find((m) => m._id.toString() === modelId);
  
    if (!model) return null;
  
    // Map all models of this product to only include modelId and modelName
    const allModels = product.productModels.map((m) => ({
      modelId: m._id.toString(),
      modelName: m.modelName,
    }));
  
    return {
      productId: product._id.toString(),
      productTitle: product.productTitle,
      description: product.description,
      modelId: model._id.toString(),
      modelName: model.modelName,
      status: model.status,
      productModelDetails: model.productModelDetails || null,
      allModels,
    };
  };
  
  export const getProductsBySchemeService = async (schemeKey: string): Promise<any[]> => {
    await dbConnect();
    const products = await Demo.find(
      {},
      {
        productTitle: 1,
        productCategory: 1,
        description: 1,
        productModels: 1,
      }
    ).lean();
  
    const result: any[] = [];
  
    for (const product of products) {
      const matchedModels: any[] = [];
  
      for (const model of product.productModels || []) {
        const scheme = model.productModelDetails?.scheme as any;
  
        if (
          model.status === "Live" &&
          scheme?.[schemeKey] === true
        ) {
          matchedModels.push({
            modelId: model._id.toString(),
            modelName: model.modelName,
            status: model.status,
            productModelDetails: model.productModelDetails ?? {},
          });
        }
      }
  
      if (matchedModels.length > 0) {
        result.push({
          productId: product._id.toString(),
          productTitle: product.productTitle,
          productCategory: product.productCategory,
          description: product.description,
          models: matchedModels,
        });
      }
    }
  
    return result;
  };
  
  export const getValuableProductsService = async (): Promise<any[]> => {
    await dbConnect();
    const valuableItems = await Demo.aggregate([
      { $unwind: "$productModels" },
      {
        $match: {
          "productModels.productModelDetails.scheme.valuableProduct": true
        }
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productTitle: 1,
          productCategory: 1,
          modelId: "$productModels._id",
          modelName: "$productModels.modelName",
          status: "$productModels.status",
          details: "$productModels.productModelDetails"
        }
      }
    ]);
    return valuableItems;
  };

  interface AddColorToModelData {
    colorName: string;
    stock: number;
    imageUrl: string;
    productImages: { url: string }[];
    galleryImages: { url: string }[];
}

export const addColorToModelService = async (
    productId: string,
    modelId: string,
    data: AddColorToModelData
) => {
    await dbConnect();
    const product = await Demo.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    const model = (product.productModels as any).id(modelId);
    if (!model) {
        throw new Error('Model not found');
    }

    if (!model.productModelDetails) {
        model.productModelDetails = {
            colors: [],
            specifications: [],
            productSpecifications: [],
            productFeatures: [],
            productFeaturesIcons: [],
            standardParameters: [],
            optionalParameters: [],
            warranty: [],
            scheme: {
                saleProduct: false,
                tradingProduct: false,
                companyProduct: false,
                valuableProduct: false,
                recommendedProduct: false,
            }
        };
    }

    const colorObj = {
        colorName: data.colorName,
        imageUrl: data.imageUrl,
        productImageUrl: data.productImages,
        productGallery: data.galleryImages,
        stock: data.stock ? Number(data.stock) : 0,
    };

    model.productModelDetails.colors.push(colorObj as any);
    await product.save();

    return colorObj;
};
