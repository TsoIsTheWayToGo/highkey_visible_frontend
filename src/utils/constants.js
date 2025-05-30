export const SPACE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'yard', label: 'Yard' },
  { value: 'wall', label: 'Wall' },
  { value: 'fence', label: 'Fence' },
  { value: 'balcony', label: 'Balcony' },
  { value: 'storefront', label: 'Storefront' },
  { value: 'other', label: 'Other' },
];

export const USER_TYPES = [
  { value: 'host', label: 'Space Owner (Host)' },
  { value: 'advertiser', label: 'Advertiser' },
  { value: 'both', label: 'Both' },
];

export const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'active', label: 'Active', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'gray' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

export const DEFAULT_CENTER = {
  lat: 32.9618,
  lng: -96.7841, // Dallas area
};

export const PRICE_RANGES = [
  { label: 'Under $30/day', min: 0, max: 30 },
  { label: '$30-50/day', min: 30, max: 50 },
  { label: '$50-75/day', min: 50, max: 75 },
  { label: '$75+/day', min: 75, max: 1000 },
];