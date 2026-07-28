type UnauthorizedListener = () => void;

let accessToken: string | null = null;
let refreshToken: string | null = null;
let unauthorizedListener: UnauthorizedListener | null = null;
let hasNotifiedUnauthorized = false;

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  hasNotifiedUnauthorized = false;
}

export function setAccessToken(token: string) {
  accessToken = token;
  hasNotifiedUnauthorized = false;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListener = listener;
}

export function notifyUnauthorized() {
  if (hasNotifiedUnauthorized) return;
  hasNotifiedUnauthorized = true;
  unauthorizedListener?.();
}
