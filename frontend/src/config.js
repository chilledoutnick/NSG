// NSG CRM — Centralized Frontend Configuration

export const APP_NAME = process.env.REACT_APP_APP_NAME || "NSG CRM";
export const COMPANY_NAME = process.env.REACT_APP_COMPANY_NAME || "Network Sales & Growth";
export const BRAND_NAME = process.env.REACT_APP_BRAND_NAME || "NSG";

export const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.REACT_APP_FRONTEND_URL || "http://localhost:3000";
};

export const getApiUrl = () => {
  if (typeof window !== "undefined" && window.REACT_APP_API_URL && window.REACT_APP_API_URL !== "{{ api_url }}") {
    return window.REACT_APP_API_URL;
  }
  return process.env.REACT_APP_API_URL || (typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8000");
};

export const isProduction = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  }
  return process.env.NODE_ENV === "production";
};

