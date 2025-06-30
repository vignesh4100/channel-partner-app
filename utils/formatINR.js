// utils/formatINR.js
export default function formatINR(amount) {
  if (!amount) return '₹0.00';
  return `₹${parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
