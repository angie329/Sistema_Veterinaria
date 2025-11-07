import { config } from "@/config/env.js";

const KEY_TOKEN = "token";
const KEY_USER  = "user";

export function getToken()   { return localStorage.getItem(KEY_TOKEN); }
export function getUser()    { try { return JSON.parse(localStorage.getItem(KEY_USER)||"null"); } catch { return null; } }
export function isLoggedIn() { return !!getToken(); }

export async function login(username, password) {
  const res = await fetch(`${config.BACKEND_URL}/v1/aut/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Error de login");
  localStorage.setItem(KEY_TOKEN, data.token);
  localStorage.setItem(KEY_USER, JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_USER);
  // recargar para que se refresque el header/nav
  location.reload();
}

export function authHeader() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}