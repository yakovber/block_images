module.exports = {
    PORT: 3000,
    JWT_SECRET: 'ohisvflgufb&saca^&*^%$#@!@#$%^&*()_+',
    ADMIN_CODE_HASH: '$2b$10$HAHUuA8abTKTCj2ourd9leazEpsWpRRHFXMPGeK3VCEL3NE.c70ye',
    DATABASE: {
        client: 'postgresql',
        connection: {
            host: 'localhost',
            user: 'yakov',
            password: '0504174415',
            database: 'block_img',
            port: 5432
        },
        pool: {
            min: 2,
            max: 10
        }
    },
    FILE_LIMITS: {
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB to match express limits
        ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/gif']
    }
};
