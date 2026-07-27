type UnauthorizedListener = () => void;

let accessToken: string | null = null;
let refreshToken: string | null = null;
let unauthorizedListener: UnauthorizedListener | null = null;

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
}

export function onUnauthorized(listener: UnauthorizedListener) {
  unauthorizedListener = listener;
}

export function notifyUnauthorized() {
  unauthorizedListener?.();
}
