import axios from 'axios';

export const fetchProductDetails = async (barcode) => {
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    
    if (response.data && response.data.status === 1) {
      const product = response.data.product;
      const isHalal = product.labels_tags?.includes('halal');
      
      return {
        name: product.product_name || 'Unknown',
        halalStatus: isHalal ? 'Halal' : 'Not Halal',
      };
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    throw new Error('Failed to fetch product details');
  }
};
