export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export enum CourseCurrency {
  dollar = "dollar",
  rupee = "rupee",
}

export enum TransactionStatus {
  pending = "pending",
  completed = "completed",
  failed = "failed",
}

export enum AuthIdentifiers {
  email = "email",
  phone = "phone",
}

export const coursesSortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name A-Z", value: "name" },
  { label: "Price Low-High", value: "price-low" },
  { label: "Price High-Low", value: "price-high" },
];

export const currencyOptions = [
  { label: "Dollar ($)", value: CourseCurrency.dollar },
  { label: "Rupee (₹)", value: CourseCurrency.rupee },
];

export const OTPExpiryTime = 5 * 60 * 1000;
