export default () => ({
  port: parseInt(process.env.PORT || '5432', 10), // Default to '3000' if undefined
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION,
});
