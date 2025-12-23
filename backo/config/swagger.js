const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Baco Clothing API',
            version: '1.0.0',
            description: 'API documentation for Baco Backend',
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },

    apis: ['./routes/*.js'], // 👈VERYIMPORTANT  
};

module.exports = swaggerJSDoc(options);
