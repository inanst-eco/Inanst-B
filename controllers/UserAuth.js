const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, phone, country } = req.body;

    if (!fullName || !email || !password || !phone || !country) {
        return res.status(400).json({ msg: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // If user exists and is already verified, block registration
    if (user && user.isVerified) {
      return res.status(400).json({ msg: "User already exists and is verified. Please login." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otpCode = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    if (user && !user.isVerified) {
      // Update existing record
      user.name = fullName; 
      user.password = hashedPassword;
      user.phone = phone;
      user.country = country;
      user.verificationToken = otpCode;
      user.verificationExpires = otpExpires;
      await user.save();
    } else {
      // Create new user record
      user = new User({
        name: fullName, 
        email,
        phone,
        country,
        password: hashedPassword,
        verificationToken: otpCode,
        verificationExpires: otpExpires,
        role: "regular",
        isVerified: false
      });
      await user.save();
    }

    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Verify Your Inanst Account</h2>
        <p>Hi ${fullName}, your 6-digit verification code is:</p>
        <h1 style="letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px; display: inline-block;">${otpCode}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;

    try {
      await sendEmail(user.email, "Inanst Verification Code", message);
      return res.status(201).json({ msg: "OTP sent to email", email: user.email });
    } catch (emailErr) {
      console.error("User created, but email failed:", emailErr.message);
      // We return 201 so the frontend still shows the OTP modal
      return res.status(201).json({ 
        msg: "Account ready! Code delivery delayed. Please click Resend OTP.",
        emailError: true,
        email: user.email
      });
    }

  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({ msg: "Server Error during registration" });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (user.isVerified) return res.status(400).json({ msg: "Email already verified" });

    const newOtp = generateOTP();
    user.verificationToken = newOtp;
    user.verificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">New Verification Code</h2>
        <p>Your new 6-digit verification code is:</p>
        <h1 style="letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px; display: inline-block;">${newOtp}</h1>
      </div>
    `;

    try {
      await sendEmail(user.email, "New Inanst Verification Code", message);
      return res.json({ msg: "New code sent to email" });
    } catch (emailErr) {
      console.error("Resend Email Error:", emailErr.message);
      return res.status(500).json({ msg: "Email service timeout. Please try again in 1 minute." });
    }
  } catch (err) {
    console.error("Resend OTP Server Error:", err.message);
    return res.status(500).json({ msg: "Server error during OTP resend" });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ msg: "Email and code are required" });

    const user = await User.findOne({ 
      email, 
      verificationToken: code,
      verificationExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired code" });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    return res.json({
      msg: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error during verification" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });
    if (!user.isVerified) return res.status(401).json({ msg: "Please verify your email first" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    return res.json({ 
      token, 
      user: { id: user._id, name: user.name, role: user.role } 
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error during login" });
  }
};