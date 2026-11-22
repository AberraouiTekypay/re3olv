export function getWebAppUrl(): string {
  const configuredUrl = process.env.WEB_APP_URL;
  if (configuredUrl) {
    const url = new URL(configuredUrl);
    const production = process.env.NODE_ENV === 'production';
    if (url.username || url.password || url.search || url.hash || (production && url.protocol !== 'https:')) {
      throw new Error('WEB_APP_URL must be a valid HTTPS URL in production');
    }
    return configuredUrl.replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('WEB_APP_URL must be configured in production');
  }
  return 'http://localhost:3000';
}
