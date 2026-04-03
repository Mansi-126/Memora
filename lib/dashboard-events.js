/**
 * Cross-dashboard refresh: sidebar badge counts and any page that listens (e.g. Sources folder list).
 * Call after mutations that change counts without a full navigation.
 */
export const MEMORA_DASHBOARD_REFRESH = "memora:dashboard-refresh";

export function refreshDashboardSidebar() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MEMORA_DASHBOARD_REFRESH));
}
