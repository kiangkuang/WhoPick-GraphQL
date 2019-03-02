import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 4000,
  dbUrl: process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
};
