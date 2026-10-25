/**
 * Utility functions for Indian Rupee (INR) currency formatting.
 * Strictly adheres to the 'en-IN' locale and 'INR' currency standard.
 *
 * Examples:
 *   formatINR(250)                      => "₹250"
 *   formatINR(1250)                     => "₹1,250"
 *   formatINR(1250.50)                  => "₹1,250.50"
 *   formatINR(250, { showDecimals: true }) => "₹250.00"
 */

export const formatINR = (amount, { showDecimals = false } = {}) => {
  const num = typeof amount === 'number' ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : (num % 1 === 0 ? 0 : 2),
    maximumFractionDigits: 2,
  }).format(num);
};

export default formatINR;
