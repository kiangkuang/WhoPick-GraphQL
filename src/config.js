import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 4000,
  dbUrl: process.env.DB_URL,
  jwtSecret: process.env.JWT_SECRET,
  adminIds: process.env.ADMIN_IDS.split(','),
  botUsername: process.env.BOT_USERNAME,
  botToken: process.env.BOT_TOKEN,
};
