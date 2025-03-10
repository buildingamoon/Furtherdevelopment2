export const formatDate = (date, formatType) => {
  const d = new Date(date);

  if (formatType === 'day') {
    return d.getDate();
  }

  if (formatType === 'monthYear') {
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${month} ${year}`;
  }

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Change to false if you prefer 24-hour format
  });
};

// /composables/globalfunction.js
export function getExcerpt(content) {
  const words = content.split(' ');
  if (words.length <= 15) {
      return content;
  }
  return words.slice(0, 15).join(' ') + '...';
};

/**
 * Formats the price from cents to dollars or other major currency units.
 * @param {number} priceInCents - The price in the smallest currency unit (e.g., cents).
 * @return {string} The formatted price in dollars or other major currency units.
 */
export function formatPrice(priceInCents) {
  return (priceInCents / 100).toFixed(2); // 将价格转换为美元或港币，并保留两位小数
};
