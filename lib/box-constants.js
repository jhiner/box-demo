module.exports = {
  HEADERS: {
    V2_AUTH_ACCESS: 'Bearer'
  },
  DEFAULT_SETTINGS: {
    JWT_EXPIRATION: '10s',
    JWT_ALGORITHM: 'RS256',
    JWT_TYPE: 'JWT',
    JWT_GRANT_TYPE: 'urn:ietf:params:oauth:grant-type:jwt-bearer'
  },
  BASE_URL: 'https://api.box.com/oauth2/token',
  APP_USERS_URL: 'https://api.box.com/2.0/users',
  ENTERPRISE: 'enterprise',
  USER: 'user'
};