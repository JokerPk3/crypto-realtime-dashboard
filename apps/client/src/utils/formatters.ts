export const formatPrice = (
  value: string | number
): string => {
  const number =
    typeof value === 'string'
      ? parseFloat(value)
      : value;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export const formatSize = (
  value: string | number
): string => {
  const number =
    typeof value === 'string'
      ? parseFloat(value)
      : value;

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(number);
};

export const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString();
};

export const truncate = (
  value: string,
  max = 12
): string => {
  if (value.length <= max) return value;

  return `${value.slice(0, max)}...`;
};