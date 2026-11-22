export function getWebAppUrl(): string {
  const configuredUrl = process.env.WEB_APP_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('WEB_APP_URL must be configured in production');
  }
  return 'http://localhost:3000';
}
