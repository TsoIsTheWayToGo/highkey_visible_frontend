#!/bin/bash

# Base directory
BASE_DIR="src"

# Array of paths to create
FILES=(
  "components/common/Header.jsx"
  "components/common/Footer.jsx"
  "components/common/LoadingSpinner.jsx"
  "components/common/ErrorBoundary.jsx"
  "components/common/ProtectedRoute.jsx"

  "components/auth/LoginForm.jsx"
  "components/auth/SignupForm.jsx"
  "components/auth/AuthModal.jsx"

  "components/spaces/SpaceCard.jsx"
  "components/spaces/SpaceDetails.jsx"
  "components/spaces/SpaceForm.jsx"
  "components/spaces/SpaceGallery.jsx"
  "components/spaces/SpaceMap.jsx"
  "components/spaces/SpaceFilters.jsx"

  "components/bookings/BookingForm.jsx"
  "components/bookings/BookingCard.jsx"
  "components/bookings/BookingStatus.jsx"
  "components/bookings/BookingCalendar.jsx"

  "components/messages/MessageThread.jsx"
  "components/messages/MessageInput.jsx"

  "components/ui/Button.jsx"
  "components/ui/Input.jsx"
  "components/ui/Modal.jsx"
  "components/ui/Card.jsx"

  "pages/Home.jsx"
  "pages/Search.jsx"
  "pages/SpaceDetail.jsx"
  "pages/Dashboard.jsx"
  "pages/CreateSpace.jsx"
  "pages/Profile.jsx"

  "hooks/useAuth.js"
  "hooks/useSpaces.js"
  "hooks/useBookings.js"
  "hooks/useMap.js"

  "services/api.js"
  "services/auth.js"
  "services/spaces.js"
  "services/bookings.js"
  "services/payments.js"

  "store/authStore.js"
  "store/spacesStore.js"
  "store/bookingsStore.js"

  "utils/formatters.js"
  "utils/validators.js"
  "utils/constants.js"

  "styles/globals.css"
)

# Loop through and create each file
for FILE in "${FILES[@]}"; do
  FILE_PATH="${BASE_DIR}/${FILE}"
  DIR_PATH=$(dirname "$FILE_PATH")
  
  mkdir -p "$DIR_PATH"
  touch "$FILE_PATH"

  echo "Created: $FILE_PATH"
done

echo "✅ All files and folders created successfully."
