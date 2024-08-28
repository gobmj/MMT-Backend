const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const userModel = require('../models/user-model');
const ErrorHandler = require('../middleware/errorHandlers');
const { catchAsyncError } = require('../middleware/catchAsyncError');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Replace with your Google Client ID

module.exports.signUpWithGoogle = async (req, res) => {
  const { token } = req.body;

  console.log("dcd",process.env.GOOGLE_CLIENT_ID,);
  

  try {
    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Specify the client ID
    });

    const payload = ticket.getPayload();
    const userId = payload.sub;
    const email = payload.email;
    const picture = payload.picture;

    // Optionally create a JWT token or any session handling here
    const jwtToken = jwt.sign({ userId, email, picture }, 'your_secret_key', { expiresIn: '1h' });

    // Respond with user data and token
    res.status(200).json({
      user: { userId, email, picture},
      token: jwtToken,
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).send('Unauthorized');
  }
};

module.exports.logIn = catchAsyncError(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new ErrorHandler("username or password not passed", 400));
    }

    const user = await userModel.findOne({
        username: username,
    });

    if (!user) {
        return next(new ErrorHandler("Invalid credentials or user not found", 401));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return next(new ErrorHandler("Invalid credentials", 401));
    }

    const token = jwt.sign({ 
        username: username
    }, process.env.SECRETKEY, { 
        expiresIn: '14h' 
    });

    res.json({
        code: 200,
        message: 'Login successful',
        token: token,
    });
});

module.exports.signUp = async (req, res, next) => {
    const { username, password, name } = req.body;

    if (!username || !password || !name ) {
        return next(new ErrorHandler("username or password not passed or not validated", 400));
    }

    const user = await userModel.findOne({
        username:username
    });

    if (user) {
        return res.status(409).json({ message: 'username already exists', code: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const date = new Date()
    const newUser = new userModel({
        username: username,
        password: hashedPassword,
        name: name,
        createdAt: {
            string:date.toLocaleString(),
            timestamp:date.getTime()
        }
    });

    const result = await newUser.save();

    if (result !== null) {
        res.json({
            code: 200,
            message: 'User created',
            data: result
        });
    } else {
        return next(new ErrorHandler("Failed to create user", 500));
    }
};

module.exports.logOut = catchAsyncError(async (req, res, next) => {
    try {

    } catch (error) {

    }
});

module.exports.whoami = catchAsyncError(async (req, res, next) => {
    const { token } = req.body;

    if (!token) {
        return next(new ErrorHandler("Token not found", 400));
    }

    const decoded = jwt.verify(token, process.env.SECRETKEY);

    if(!decoded){
        res.json({
            code: 401,
            message: 'Token expired or invalid',
        });
    }

    res.json({
        code: 200,
        message: 'user verified',
        user: decoded
    });
});

module.exports.changePassword = catchAsyncError(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password ) {
        return next(new ErrorHandler("username or password not found", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.findOneAndUpdate({
        username:username
    },{
        password: hashedPassword
    })

    if(!user){
        return next(new ErrorHandler("user password not updated", 400));
    }

    res.json({
        code: 200,
        status: 'success',
        user: user
    });
});