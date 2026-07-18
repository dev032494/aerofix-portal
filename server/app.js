var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json'); // Import the swagger documentation setup
const cors = require('cors');
const authRouter = require('./routes/authRoutes');

// Load environment variables
dotenv.config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/userRoutes');
const { apiRouter } = require('./routes/api');

var app = express();

// Enable Cross-Origin requests for your web app instance connection mapping channels
app.use(cors({
  origin: '*', // Vite default development port mapping handle
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =========================================================================
// 1. REQUEST LOGGING & BODY PARSING (Must be defined first)
// =========================================================================
app.use(logger('dev')); // Logs incoming HTTP requests directly to your terminal
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// =========================================================================
// 2. SWAGGER & APPLICATION ROUTES
// =========================================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', apiRouter);


app.use('/api/v1/auth', authRouter);

app.use('/', indexRouter);


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// =========================================================================
// 3. EXPLICIT ERROR LOGGING INTERCEPTOR (Must sit before rendering)
// =========================================================================
app.use(function(err, req, res, next) {
  const timestamp = new Date().toISOString();
  
  console.error(`\n🚨 [${timestamp}] ERROR DETECTED ON ${req.method} ${req.url}`);
  console.error(`Message: ${err.message}`);
  
  // Log body data if it's an API route (excluding passwords for safety)
  if (req.body && Object.keys(req.body).length > 0) {
    const safeBody = { ...req.body };
    if (safeBody.password) safeBody.password = '********';
    if (safeBody.password_hash) safeBody.password_hash = '********';
    console.error('Payload context:', JSON.stringify(safeBody, null, 2));
  }
  
  // Print full operational system stack traces for debugging
  console.error('Stack Trace:\n', err.stack);
  console.error(`=========================================================\n`);
  
  next(err); // Pass it down to the rendering handler below
});

// =========================================================================
// 4. CENTRAL VIEW/RESPONSE ERROR HANDLER
// =========================================================================
app.use(function(err, req, res, next) {
  const isDevelopment = req.app.get('env') === 'development';
  const statusCode = err.status || 500;

  // Check if the request was pointing to an API path to avoid serving raw HTML/EJS views to your frontend
  if (req.url.startsWith('/api/')) {
    return res.status(statusCode).json({
      status: 'error',
      message: err.message,
      ...(isDevelopment && { stack: err.stack })
    });
  }

  // Fallback: render the local view template error page
  res.locals.message = err.message;
  res.locals.error = isDevelopment ? err : {};
  res.status(statusCode);
  res.render('error');
});

module.exports = app;