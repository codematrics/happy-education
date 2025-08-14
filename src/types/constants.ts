export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export enum CourseCurrency {
  dollar = "dollar",
  rupee = "rupee",
}

export const coursesSortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Name A-Z", value: "name" },
  { label: "Price Low-High", value: "price-low" },
  { label: "Price High-Low", value: "price-high" },
];
