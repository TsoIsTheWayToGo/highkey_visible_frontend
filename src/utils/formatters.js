export const formatCurrency = (dollarAmount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollarAmount);
};

export const formatSpaceType = (type) => {
  const types = {
    yard: 'Yard',
    wall: 'Wall',
    fence: 'Fence',
    balcony: 'Balcony',
    storefront: 'Storefront',
    other: 'Other',
  };
  return types[type] || type;
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatBookingStatus = (status) => {
  const statuses = {
    pending: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active Campaign',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statuses[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};