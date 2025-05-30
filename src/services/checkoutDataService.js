const CHECKOUT_DATA_KEY = 'checkoutData';

export const saveCheckoutData = (data) => {
  try {
    localStorage.setItem(CHECKOUT_DATA_KEY, JSON.stringify(data));
    console.log('Checkout data saved:', data);
    return true;
  } catch (error) {
    console.error('Error saving checkout data:', error);
    return false;
  }
};

export const getCheckoutData = () => {
  try {
    const data = localStorage.getItem(CHECKOUT_DATA_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      console.log('Checkout data loaded:', parsed);
      return parsed;
    }
    return null;
  } catch (error) {
    console.error('Error loading checkout data:', error);
    return null;
  }
};

export const clearCheckoutData = () => {
  try {
    localStorage.removeItem(CHECKOUT_DATA_KEY);
    console.log('Checkout data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing checkout data:', error);
    return false;
  }
};

export const createCheckoutData = (cartItems, subtotal, discount = 0, shipping = 0, appliedCoupon = null, shippingInfo = null) => {
  return {
    items: cartItems,
    subtotal,
    discount,
    shipping,
    total: subtotal + shipping - discount,
    appliedCoupon,
    shippingInfo,
    timestamp: Date.now()
  };
};