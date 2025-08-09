import { objectType, extendType, arg, nonNull, stringArg, intArg, floatArg, booleanArg, inputObjectType } from 'nexus';
import { transformFields } from '../utils/field-transformer';

// Product Types
export const Product = objectType({
  name: 'Product',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('shortDescription');
    t.string('sku');
    t.nonNull.float('price');
    t.float('salePrice');
    t.string('status');
    t.int('stockQuantity');
    t.boolean('manageStock');
    t.int('lowStockThreshold');
    t.boolean('inStock');
    t.string('weight');
    t.string('dimensions');
    t.string('shippingClass');
    t.boolean('featured');
    t.string('catalogVisibility');
    t.string('type');
    t.string('parentId');
    t.string('categoryId');
    t.string('brandId');
    t.list.string('images');
    t.string('thumbnailImage');
    t.string('metaTitle');
    t.string('metaDescription');
    t.string('metaKeywords');
    t.int('views');
    t.float('averageRating');
    t.int('ratingCount');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    // Relations
    t.field('category', {
      type: 'ProductCategory',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.categoryId) return null;
        const fields = transformFields(info);
        return ctx.prisma.product_categories.findUnique({
          where: { id: parent.categoryId },
          ...fields
        });
      }
    });

    t.field('brand', {
      type: 'ProductBrand',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.brandId) return null;
        const fields = transformFields(info);
        return ctx.prisma.product_brands.findUnique({
          where: { id: parent.brandId },
          ...fields
        });
      }
    });

    t.list.field('variants', {
      type: 'Product',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.products.findMany({
          where: { parentId: parent.id },
          ...fields
        });
      }
    });

    t.field('parent', {
      type: 'Product',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.parentId) return null;
        const fields = transformFields(info);
        return ctx.prisma.products.findUnique({
          where: { id: parent.parentId },
          ...fields
        });
      }
    });

    t.list.field('attributes', {
      type: 'ProductAttribute',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.product_attributes.findMany({
          where: { productId: parent.id },
          ...fields
        });
      }
    });

    t.list.field('reviews', {
      type: 'ProductReview',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.product_reviews.findMany({
          where: { 
            productId: parent.id,
            status: 'approved'
          },
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });
  }
});

export const ProductCategory = objectType({
  name: 'ProductCategory',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('image');
    t.string('parentId');
    t.int('sortOrder');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('parent', {
      type: 'ProductCategory',
      resolve: async (parent, _args, ctx, info) => {
        if (!parent.parentId) return null;
        const fields = transformFields(info);
        return ctx.prisma.product_categories.findUnique({
          where: { id: parent.parentId },
          ...fields
        });
      }
    });

    t.list.field('children', {
      type: 'ProductCategory',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.product_categories.findMany({
          where: { parentId: parent.id },
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });

    t.int('productsCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.products.count({
          where: { categoryId: parent.id }
        });
      }
    });
  }
});

export const ProductBrand = objectType({
  name: 'ProductBrand',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('logo');
    t.string('website');
    t.nonNull.boolean('isActive');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.int('productsCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.products.count({
          where: { brandId: parent.id }
        });
      }
    });
  }
});

export const ProductAttribute = objectType({
  name: 'ProductAttribute',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('productId');
    t.nonNull.string('name');
    t.nonNull.string('value');
    t.string('type');
    t.boolean('isVariation');
    t.int('sortOrder');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('product', {
      type: 'Product',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.products.findUnique({
          where: { id: parent.productId },
          ...fields
        });
      }
    });
  }
});

export const ProductReview = objectType({
  name: 'ProductReview',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('productId');
    t.string('customerId');
    t.string('customerName');
    t.string('customerEmail');
    t.nonNull.int('rating');
    t.string('title');
    t.string('content');
    t.nonNull.string('status');
    t.boolean('verified');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('product', {
      type: 'Product',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.products.findUnique({
          where: { id: parent.productId },
          ...fields
        });
      }
    });

    t.field('customer', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.customerId) return null;
        return ctx.dataloaders.userById.load(parent.customerId);
      }
    });
  }
});

export const Order = objectType({
  name: 'Order',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('orderNumber');
    t.string('customerId');
    t.string('customerEmail');
    t.string('customerPhone');
    t.nonNull.string('status');
    t.nonNull.string('paymentStatus');
    t.string('paymentMethod');
    t.nonNull.float('subtotal');
    t.nonNull.float('tax');
    t.nonNull.float('shipping');
    t.nonNull.float('discount');
    t.nonNull.float('total');
    t.string('currency');
    t.string('notes');
    t.string('billingAddress');
    t.string('shippingAddress');
    t.string('trackingNumber');
    t.field('shippedAt', { type: 'DateTime' });
    t.field('deliveredAt', { type: 'DateTime' });
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('customer', {
      type: 'User',
      resolve: async (parent, _args, ctx) => {
        if (!parent.customerId) return null;
        return ctx.dataloaders.userById.load(parent.customerId);
      }
    });

    t.list.field('items', {
      type: 'OrderItem',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.order_items.findMany({
          where: { orderId: parent.id },
          ...fields
        });
      }
    });

    t.int('itemsCount', {
      resolve: async (parent, _args, ctx) => {
        return ctx.prisma.order_items.count({
          where: { orderId: parent.id }
        });
      }
    });
  }
});

export const OrderItem = objectType({
  name: 'OrderItem',
  definition(t) {
    t.nonNull.string('id');
    t.nonNull.string('orderId');
    t.nonNull.string('productId');
    t.string('productName');
    t.string('productSku');
    t.string('productImage');
    t.nonNull.int('quantity');
    t.nonNull.float('price');
    t.nonNull.float('total');
    t.string('attributes');
    t.nonNull.field('createdAt', { type: 'DateTime' });
    t.nonNull.field('updatedAt', { type: 'DateTime' });

    t.field('order', {
      type: 'Order',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.orders.findUnique({
          where: { id: parent.orderId },
          ...fields
        });
      }
    });

    t.field('product', {
      type: 'Product',
      resolve: async (parent, _args, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.products.findUnique({
          where: { id: parent.productId },
          ...fields
        });
      }
    });
  }
});

// Input Types
export const ProductCreateInput = inputObjectType({
  name: 'ProductCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('shortDescription');
    t.string('sku');
    t.nonNull.float('price');
    t.float('salePrice');
    t.string('status');
    t.int('stockQuantity');
    t.boolean('manageStock');
    t.int('lowStockThreshold');
    t.string('weight');
    t.string('dimensions');
    t.string('shippingClass');
    t.boolean('featured');
    t.string('catalogVisibility');
    t.string('type');
    t.string('parentId');
    t.string('categoryId');
    t.string('brandId');
    t.list.string('images');
    t.string('thumbnailImage');
    t.string('metaTitle');
    t.string('metaDescription');
    t.string('metaKeywords');
  }
});

export const ProductUpdateInput = inputObjectType({
  name: 'ProductUpdateInput',
  definition(t) {
    t.string('name');
    t.string('slug');
    t.string('description');
    t.string('shortDescription');
    t.string('sku');
    t.float('price');
    t.float('salePrice');
    t.string('status');
    t.int('stockQuantity');
    t.boolean('manageStock');
    t.int('lowStockThreshold');
    t.string('weight');
    t.string('dimensions');
    t.string('shippingClass');
    t.boolean('featured');
    t.string('catalogVisibility');
    t.string('type');
    t.string('parentId');
    t.string('categoryId');
    t.string('brandId');
    t.list.string('images');
    t.string('thumbnailImage');
    t.string('metaTitle');
    t.string('metaDescription');
    t.string('metaKeywords');
  }
});

export const ProductCategoryCreateInput = inputObjectType({
  name: 'ProductCategoryCreateInput',
  definition(t) {
    t.nonNull.string('name');
    t.string('slug');
    t.string('description');
    t.string('image');
    t.string('parentId');
    t.int('sortOrder');
    t.boolean('isActive');
  }
});

export const ProductReviewCreateInput = inputObjectType({
  name: 'ProductReviewCreateInput',
  definition(t) {
    t.nonNull.string('productId');
    t.string('customerName');
    t.string('customerEmail');
    t.nonNull.int('rating');
    t.string('title');
    t.string('content');
  }
});

export const OrderCreateInput = inputObjectType({
  name: 'OrderCreateInput',
  definition(t) {
    t.string('customerId');
    t.string('customerEmail');
    t.string('customerPhone');
    t.string('paymentMethod');
    t.string('notes');
    t.string('billingAddress');
    t.string('shippingAddress');
    t.list.field('items', { type: 'OrderItemInput' });
  }
});

export const OrderItemInput = inputObjectType({
  name: 'OrderItemInput',
  definition(t) {
    t.nonNull.string('productId');
    t.nonNull.int('quantity');
    t.string('attributes');
  }
});

// Extend Queries
export const ShopQueries = extendType({
  type: 'Query',
  definition(t) {
    // Products
    t.list.field('products', {
      type: 'Product',
      args: {
        skip: intArg(),
        take: intArg(),
        search: stringArg(),
        categoryId: stringArg(),
        brandId: stringArg(),
        status: stringArg(),
        featured: booleanArg(),
        inStock: booleanArg(),
        minPrice: floatArg(),
        maxPrice: floatArg(),
        sortBy: stringArg(),
        sortOrder: stringArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { 
          skip, take, search, categoryId, brandId, status, 
          featured, inStock, minPrice, maxPrice, sortBy, sortOrder 
        } = args;
        
        const where: any = {};
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (categoryId) {
          where.categoryId = categoryId;
        }
        
        if (brandId) {
          where.brandId = brandId;
        }
        
        if (status) {
          where.status = status;
        }
        
        if (featured !== undefined) {
          where.featured = featured;
        }
        
        if (inStock !== undefined) {
          where.inStock = inStock;
        }
        
        if (minPrice || maxPrice) {
          where.price = {};
          if (minPrice) {
            where.price.gte = minPrice;
          }
          if (maxPrice) {
            where.price.lte = maxPrice;
          }
        }
        
        const orderBy: any = {};
        if (sortBy) {
          orderBy[sortBy] = sortOrder || 'asc';
        } else {
          orderBy.createdAt = 'desc';
        }
        
        return ctx.prisma.products.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy,
          ...fields
        });
      }
    });

    t.field('product', {
      type: 'Product',
      args: {
        id: stringArg(),
        slug: stringArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { id, slug } = args;
        
        if (!id && !slug) {
          throw new Error('Either id or slug must be provided');
        }
        
        const where = id ? { id } : { slug };
        
        // Increment view count
        const product = await ctx.prisma.products.findUnique({ where });
        if (product) {
          await ctx.prisma.products.update({
            where,
            data: { views: { increment: 1 } }
          });
        }
        
        return ctx.prisma.products.findUnique({
          where,
          ...fields
        });
      }
    });

    // Product Categories
    t.list.field('productCategories', {
      type: 'ProductCategory',
      args: {
        parentId: stringArg(),
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { parentId, isActive } = args;
        
        const where: any = {};
        
        if (parentId !== undefined) {
          where.parentId = parentId;
        }
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.product_categories.findMany({
          where,
          orderBy: { sortOrder: 'asc' },
          ...fields
        });
      }
    });

    // Product Brands
    t.list.field('productBrands', {
      type: 'ProductBrand',
      args: {
        isActive: booleanArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { isActive } = args;
        
        const where: any = {};
        
        if (isActive !== undefined) {
          where.isActive = isActive;
        }
        
        return ctx.prisma.product_brands.findMany({
          where,
          orderBy: { name: 'asc' },
          ...fields
        });
      }
    });

    // Orders
    t.list.field('orders', {
      type: 'Order',
      args: {
        skip: intArg(),
        take: intArg(),
        customerId: stringArg(),
        status: stringArg(),
        paymentStatus: stringArg(),
        orderNumber: stringArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { skip, take, customerId, status, paymentStatus, orderNumber } = args;
        
        const where: any = {};
        
        if (customerId) {
          where.customerId = customerId;
        }
        
        if (status) {
          where.status = status;
        }
        
        if (paymentStatus) {
          where.paymentStatus = paymentStatus;
        }
        
        if (orderNumber) {
          where.orderNumber = { contains: orderNumber, mode: 'insensitive' };
        }
        
        return ctx.prisma.orders.findMany({
          where,
          skip: skip || undefined,
          take: take || undefined,
          orderBy: { createdAt: 'desc' },
          ...fields
        });
      }
    });

    t.field('order', {
      type: 'Order',
      args: {
        id: stringArg(),
        orderNumber: stringArg(),
      },
      resolve: async (_parent, args, ctx, info) => {
        const fields = transformFields(info);
        const { id, orderNumber } = args;
        
        if (!id && !orderNumber) {
          throw new Error('Either id or orderNumber must be provided');
        }
        
        const where = id ? { id } : { orderNumber };
        
        return ctx.prisma.orders.findUnique({
          where,
          ...fields
        });
      }
    });
  }
});

// Extend Mutations
export const ShopMutations = extendType({
  type: 'Mutation',
  definition(t) {
    // Product mutations
    t.field('createProduct', {
      type: 'Product',
      args: {
        input: nonNull(arg({ type: 'ProductCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.products.create({
          data: {
            ...input,
            status: input.status || 'draft',
            manageStock: input.manageStock !== undefined ? input.manageStock : true,
            featured: input.featured !== undefined ? input.featured : false,
            catalogVisibility: input.catalogVisibility || 'visible',
            type: input.type || 'simple',
            inStock: input.stockQuantity ? input.stockQuantity > 0 : true,
          },
          ...fields
        });
      }
    });

    t.field('updateProduct', {
      type: 'Product',
      args: {
        id: nonNull(stringArg()),
        input: nonNull(arg({ type: 'ProductUpdateInput' })),
      },
      resolve: async (_parent, { id, input }, ctx, info) => {
        const fields = transformFields(info);
        const updateData = { ...input };
        
        // Update inStock based on stockQuantity if provided
        if (input.stockQuantity !== undefined) {
          updateData.inStock = input.stockQuantity > 0;
        }
        
        return ctx.prisma.products.update({
          where: { id },
          data: updateData,
          ...fields
        });
      }
    });

    // Product Category mutations
    t.field('createProductCategory', {
      type: 'ProductCategory',
      args: {
        input: nonNull(arg({ type: 'ProductCategoryCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        return ctx.prisma.product_categories.create({
          data: {
            ...input,
            isActive: input.isActive !== undefined ? input.isActive : true,
          },
          ...fields
        });
      }
    });

    // Product Review mutations
    t.field('createProductReview', {
      type: 'ProductReview',
      args: {
        input: nonNull(arg({ type: 'ProductReviewCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const currentUser = ctx.user;
        
        return ctx.prisma.product_reviews.create({
          data: {
            ...input,
            customerId: currentUser?.id || null,
            status: 'pending',
            verified: false,
          },
          ...fields
        });
      }
    });

    // Order mutations
    t.field('createOrder', {
      type: 'Order',
      args: {
        input: nonNull(arg({ type: 'OrderCreateInput' })),
      },
      resolve: async (_parent, { input }, ctx, info) => {
        const fields = transformFields(info);
        const { items, ...orderData } = input;
        
        // Calculate totals
        let subtotal = 0;
        const orderItems = [];
        
        for (const item of items) {
          const product = await ctx.prisma.products.findUnique({
            where: { id: item.productId }
          });
          
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          
          const price = product.salePrice || product.price;
          const itemTotal = price * item.quantity;
          subtotal += itemTotal;
          
          orderItems.push({
            productId: item.productId,
            productName: product.name,
            productSku: product.sku,
            productImage: product.thumbnailImage,
            quantity: item.quantity,
            price,
            total: itemTotal,
            attributes: item.attributes,
          });
        }
        
        const tax = subtotal * 0.1; // 10% tax
        const shipping = 10; // Fixed shipping
        const discount = 0;
        const total = subtotal + tax + shipping - discount;
        
        // Generate order number
        const orderNumber = `ORD-${Date.now()}`;
        
        const order = await ctx.prisma.orders.create({
          data: {
            ...orderData,
            orderNumber,
            status: 'pending',
            paymentStatus: 'pending',
            subtotal,
            tax,
            shipping,
            discount,
            total,
            currency: 'VND',
          },
          ...fields
        });
        
        // Create order items
        await ctx.prisma.order_items.createMany({
          data: orderItems.map(item => ({
            ...item,
            orderId: order.id
          }))
        });
        
        return order;
      }
    });

    t.field('updateOrderStatus', {
      type: 'Order',
      args: {
        id: nonNull(stringArg()),
        status: nonNull(stringArg()),
      },
      resolve: async (_parent, { id, status }, ctx, info) => {
        const fields = transformFields(info);
        const updateData: any = { status };
        
        if (status === 'shipped') {
          updateData.shippedAt = new Date();
        } else if (status === 'delivered') {
          updateData.deliveredAt = new Date();
        }
        
        return ctx.prisma.orders.update({
          where: { id },
          data: updateData,
          ...fields
        });
      }
    });
  }
});
