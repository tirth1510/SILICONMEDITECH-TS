import { NextRequest, NextResponse } from 'next/server';
import { 
  createProductStep1Service, 
  addProductModelService, 
  addProductModelDetailsService,
  getAllModelsWithProductInfoService,
  getPaddingModelsService,
  getProductSellService,
  getProductByModelIdService,
  getProductsBySchemeService,
  getValuableProductsService,
  addColorToModelService
} from '../../../../services/product.service';
import { validateAddProductModel } from '../../../../validations/product.validation';
import cloudinary from '../../../../lib/cloudinary';

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);

  if (pathname === '/api/demo/products-with-models') {
    try {
      const data = await getAllModelsWithProductInfoService();
      return NextResponse.json({
        success: true,
        count: data.length,
        data,
      }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: error.message,
      }, { status: 500 });
    }
  }

  if (pathname === '/api/demo/products/models/padding') {
    try {
      const data = await getPaddingModelsService();
      return NextResponse.json({
        success: true,
        count: data.length,
        data,
      }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: error.message,
      }, { status: 500 });
    }
  }

  if (pathname === '/api/demo/limetedtimedeal/sell') {
    try {
      const data = await getProductSellService();
      return NextResponse.json({
        success: true,
        count: data.length,
        data,
      }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({
        success: false,
        message: err.message,
      }, { status: 500 });
    }
  }

  const productByModelIdMatch = pathname.match(/\/api\/demo\/products\/model\/(.+)/);
  if (productByModelIdMatch) {
    const modelId = productByModelIdMatch[1];
    try {
      const productData = await getProductByModelIdService(modelId);
      if (!productData) {
        return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: productData }, { status: 200 });
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }

  const productsBySchemeMatch = pathname.match(/\/api\/demo\/products\/scheme\/(.+)/);
  if (productsBySchemeMatch) {
    const scheme = productsBySchemeMatch[1];
    try {
      const data = await getProductsBySchemeService(scheme);
      return NextResponse.json({
        success: true,
        count: data.length,
        data,
      }, { status: 200 });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: error.message,
      }, { status: 500 });
    }
  }

  if (pathname === '/api/demo/valuable') {
    try {
        const data = await getValuableProductsService();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Hello from the demo API!' });
}

export async function POST(req: NextRequest) {
    const { pathname } = new URL(req.url);
  
    if (pathname === '/api/demo/products') {
        try {
            const body = await req.json();
            const product = await createProductStep1Service(body);
            return NextResponse.json({
              success: true,
              message: 'Product created successfully (Step 1)',
              data: product,
            }, { status: 201 });
          } catch (error) {
            console.error("STEP-1 ERROR:", error);
            return NextResponse.json({
              success: false,
              message: "Internal server error",
            }, { status: 500 });
          }
    }
  
    const addModelMatch = pathname.match(/\/api\/demo\/products\/(.+)\/models$/);
    if (addModelMatch) {
        const productId = addModelMatch[1];
        try {
          const body = await req.json();
          const { error } = validateAddProductModel(body);
          if (error) {
            return NextResponse.json({ success: false, message: error }, { status: 400 });
          }
          const newModel = await addProductModelService(productId, body);
          return NextResponse.json({
            success: true,
            message: 'Product model added successfully',
            data: newModel,
          }, { status: 201 });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            message: error.message,
          }, { status: 400 });
        }
    }
  
    const addColorMatch = pathname.match(/\/api\/demo\/products\/(.+)\/models\/(.+)\/colors/);
    if (addColorMatch) {
        const productId = addColorMatch[1];
        const modelId = addColorMatch[2];
        try {
            const formData = await req.formData();
            const colorName = formData.get('colorName') as string;
            const stock = formData.get('stock') as string;
            const colorImage = formData.get('colorImage') as File;
            const productImagesFiles = formData.getAll('productImages') as File[];
            const galleryImagesFiles = formData.getAll('galleryImages') as File[];

            if (!colorName) {
                return NextResponse.json({ success: false, message: 'colorName is required' }, { status: 400 });
            }

            if (!colorImage) {
                return NextResponse.json({ success: false, message: 'colorImage is required' }, { status: 400 });
            }

            const uploadToCloudinary = async (file: File) => {
                const buffer = await file.arrayBuffer();
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream({ folder: 'uploads' }, (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    });
                    stream.end(Buffer.from(buffer));
                });
            };

            const mainResult = await uploadToCloudinary(colorImage) as any;

            const productImages = [];
            for (const file of productImagesFiles) {
                const result = await uploadToCloudinary(file) as any;
                productImages.push({ url: result.secure_url });
            }

            const galleryImages = [];
            for (const file of galleryImagesFiles) {
                const result = await uploadToCloudinary(file) as any;
                galleryImages.push({ url: result.secure_url });
            }

            const data = {
                colorName: colorName,
                stock: parseInt(stock),
                imageUrl: mainResult.secure_url,
                productImages,
                galleryImages,
            };

            const colorObj = await addColorToModelService(productId, modelId, data);

            return NextResponse.json({
                success: true,
                message: 'Color added successfully',
                data: colorObj,
            }, { status: 200 });

        } catch (error: any) {
            return NextResponse.json({ success: false, message: "Server error", error: error.message }, { status: 500 });
        }
    }
  
    return NextResponse.json({ message: 'POST request received' });
}

export async function PUT(req: NextRequest) {
    const { pathname } = new URL(req.url);
    const addModelDetailsMatch = pathname.match(/\/api\/demo\/products\/(.+)\/models\/(.+)\/details/);
    if (addModelDetailsMatch) {
        const productId = addModelDetailsMatch[1];
        const modelId = addModelDetailsMatch[2];
        try {
            const body = await req.json();
            const model = await addProductModelDetailsService(productId, modelId, body);
            return NextResponse.json({
                success: true,
                message: 'Model details added (Step-2)',
                data: model,
            }, { status: 200 });
        } catch (err: any) {
            return NextResponse.json({
                success: false,
                message: err.message,
            }, { status: 400 });
        }
    }
  return NextResponse.json({ message: 'PUT request received' });
}

export async function DELETE(req: NextRequest) {
  return NextResponse.json({ message: 'DELETE request received' });
}

export async function PATCH(req: NextRequest) {
    return NextResponse.json({ message: 'PATCH request received' });
}
