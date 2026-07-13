// These types map 1:1 to your Spring Boot entities.
// NOTE: fields like guide, time slot, status, photos, amenities, hours, distance
// do NOT exist on the backend yet (see Attraction.java / Booking.java).
// They are intentionally left out here rather than faked.

export type FacilityCategory =
  | "HOTEL"
  | "GUESTHOUSE"
  | "REST_STOP"
  | "FUEL_STATION"
  | "EV_CHARGING"
  | "HOSPITAL"
  | "ATM"
  | "RESTAURANT";

export interface Facility {
  id: number;
  name: string;
  category: FacilityCategory;
  latitude: number;
  longitude: number;
  address: string;
  phoneNumber?: string;
  region: string;
  distanceKm?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string; // 'TOURIST' | 'GUIDE' | 'OPERATOR' | 'ADMIN'
  phoneNumber?: string;
  createdAt?: string;
}

export interface Attraction {
  id: number;
  title: string;
  description?: string;
  region: string;
  category: string;
  latitude: number;
  longitude: number;
  basePrice?: number;
  ecoScore?: number;
  popularityCount?: number;
  imageUrl?: string;
  averageRating?: number;
  reviewCount?: number;
  distanceKm?: number;
  isFavorited?: boolean;
  createdAt?: string;
}

export interface FavoriteToggleResponse {
  favorited: boolean;
}

export interface Booking {
  id: number;
  tourist: User;
  attraction: Attraction;
  bookingDate: string;
  totalAmount: number;
  paymentStatus: string;
  syncStatus: string;
  createdAt?: string;
}

export interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface BookingRequest {
  touristId: number;
  attractionId: number;
  totalAmount: number;
}

export type PaymentMethodType = "MTN_MOMO" | "VODAFONE_CASH" | "CARD";

export type PaymentStatusType = "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";

export interface Payment {
  id: number;
  bookingId: number;
  provider: PaymentMethodType;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  phoneNumber?: string;
  externalReference?: string;
  authorizationUrl?: string;
  failureReason?: string;
  sandbox: boolean;
  message?: string;
}

export interface InitiatePaymentRequest {
  bookingId: number;
  method: PaymentMethodType;
  phoneNumber?: string;
  email?: string;
}

export interface SafetyAlert {
  id: number;
  region: string;
  title: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | string;
  activeFrom?: string;
  activeUntil?: string;
  createdAt?: string;
}

export interface VerifiedGuide {
  id: number;
  name: string;
  phoneNumber: string;
  region: string;
  transportType: string;
  licenseNumber?: string;
  rating?: number;
  verified: boolean;
  createdAt?: string;
}

export interface EmergencyContact {
  id: number;
  name: string;
  phoneNumber: string;
  relationship?: string;
  isPrimary: boolean;
  createdAt?: string;
}

export interface EmergencyContactRequest {
  name: string;
  phoneNumber: string;
  relationship?: string;
  isPrimary?: boolean;
}

export interface SafetyIncident {
  id: number;
  latitude: number;
  longitude: number;
  region?: string;
  audioPath?: string;
  durationSeconds: number;
  status: string;
  notes?: string;
  submittedAt: string;
  createdAt?: string;
}

export interface SubmitIncidentParams {
  userId: number;
  latitude: number;
  longitude: number;
  region?: string;
  durationSeconds: number;
  audioUri?: string | null;
}
