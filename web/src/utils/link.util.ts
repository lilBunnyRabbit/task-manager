import { versions } from "@/config";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/*$/, "");

export function PublicUrl(path: string) {
  return `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const LATEST_API_REFERENCE = PublicUrl(`/docs/api/${versions[0].versions[0].src}/index.html`);
