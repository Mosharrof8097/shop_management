export const formatCurrency = (amount) =>
  `৳ ${Number(amount || 0).toLocaleString('en-IN')}`;

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('bn-BD', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const formatDateEn = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

export const genInvoiceNo = () => {
  const d = new Date();
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `INV-${d.getFullYear()}-${seq}`;
};
