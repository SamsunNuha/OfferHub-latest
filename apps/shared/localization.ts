/**
 * Helper to build translation key for a product name.
 * Usage: const name = t(getProductNameKey(product.id)) || fallbackName;
 */
export const getProductNameKey = (productId: number): string => `product_name_${productId}`;
