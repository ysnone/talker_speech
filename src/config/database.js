require('dotenv').config();

const config = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/talker',
        options: {
            // Removidas las opciones obsoletas
        }
    },
    api: {
        rateLimit: parseInt(process.env.API_RATE_LIMIT) || 100,
        rateWindowMs: parseInt(process.env.API_RATE_WINDOW_MS) || 900000
    }
};

if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
    config.mongodb.options.auth = {
        username: process.env.MONGODB_USER,
        password: process.env.MONGODB_PASSWORD
    };
}

module.exports = config;
