import axios from 'axios';

class PricePredictor {
  constructor(backendUrl) {
    this.backendUrl = backendUrl;
  }

  async predictPrice(productData, token) {
    try {
      const formData = new FormData();
      
      // Append all product data
      Object.keys(productData).forEach(key => {
        if (key.startsWith('image') && productData[key]) {
          formData.append(key, productData[key]);
        } else if (key === 'sizes') {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await axios.post(
        `${this.backendUrl}/api/product/predict-price`,
        formData,
        { headers: { token } }
      );

      return response.data;
    } catch (error) {
      console.error('Price prediction error:', error);
      throw error;
    }
  }
}

export default PricePredictor;