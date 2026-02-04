import type { SessionStatus } from "../api";

export const statusBadge = (status: SessionStatus): string => {
  switch (status) {
    case "pending":
      return "badge-pending";
    case "active":
      return "badge-active";
    case "completed":
      return "badge-completed";
    case "failed":
      return "badge-failed";
    default:
      return "badge";
  }
};

export const formatDate = (value: string): string =>
  new Date(value).toLocaleString();
