// packages
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')

require('dotenv').config();

// middleware handlers
const { error } = require('./utils/error');
const isAuthenticated = require('./middleware/isAuthenticated');
const isAdmin = require('./middleware/isAdmin');

// routers
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const trucksRoutes = require('./routes/trucks');
const fuelExpensesRoutes = require('./routes/fuelExpenses');
const defExpensesRoutes = require('./routes/defExpenses');
const otherExpensesRoutes = require('./routes/otherExpenses');
const metadata = require('./routes/metadata');

// express app
const app = express();

// middlewares
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || process.env.CORS_URLS.indexOf(origin) !== -1) {
          // Allow the request
          callback(null, origin);
        } else {
          // Reject the request
          callback(new Error('Not allowed by CORS'));
        }
      },
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routes
app.use('/api/v1/app/auth', authRouter);
app.use('/api/v1/app/users', isAuthenticated, usersRouter);
app.use('/api/v1/admin', isAdmin, adminRouter);
app.use('/', indexRouter);
app.use('/api/v1/app/truck', trucksRoutes);
app.use('/api/v1/app/fuelExpenses', fuelExpensesRoutes);
app.use('/api/v1/app/defExpenses', defExpensesRoutes);
app.use('/api/v1/app/otherExpenses', otherExpensesRoutes);

app.use('/api/v1/app/metadata', metadata);

// error handler
app.use(error)

module.exports = app;