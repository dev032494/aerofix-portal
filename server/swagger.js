const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My Express API',
    description: 'Automatically generated Swagger documentation for my Express application.',
    version: '1.0.0',
  },
  host: 'localhost:5000',
  schemes: ['http', 'https'],
  // You can define global definitions (models) here
  definitions: {
    User: {
      id: 1,
      name: "John Doe",
      email: "john@example.com"
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js']; // Point to your main file where routes are imported

// Run the automation script to generate the file
swaggerAutogen(outputFile, endpointsFiles, doc);