import dotenv from 'dotenv';

dotenv.config();

export const config = {
    PORT: process.env.PORT || 5000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic-form-engine',
    JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_should_be_in_env',
    JWT_EXPIRES_IN: '1d'
};
console.log('Using MONGO_URI:', config.MONGO_URI.substring(0, 20) + '...');
export default config;
