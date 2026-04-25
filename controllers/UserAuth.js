const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const otpRateLimit = new Map();

const canSendOTP = (email) => {
  const now = Date.now();
  const record = otpRateLimit.get(email);

  if (!record) {
    otpRateLimit.set(email, { count: 1, time: now });
    return true;
  }

  // reset after 60 seconds
  if (now - record.time > 60 * 1000) {
    otpRateLimit.set(email, { count: 1, time: now });
    return true;
  }

  if (record.count >= 3) return false;

  record.count++;
  otpRateLimit.set(email, record);
  return true;
};

const register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, phone, country } = req.body;

    if (!fullName || !email || !password || !phone || !country) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ msg: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; 

    if (user && !user.isVerified) {
      user.name = fullName;
      user.password = hashedPassword;
      user.phone = phone;
      user.country = country;
      user.verificationToken = otp;
      user.verificationExpires = expires;
      await user.save();
    } else {
      user = await User.create({
        name: fullName,
        email,
        phone,
        country,
        password: hashedPassword,
        verificationToken: otp,
        verificationExpires: expires,
        role: "regular",
        isVerified: false
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    try {
      await sendEmail(
        user.email,
        "Verify your Inanst Account",
        `
          <div style="font-family:sans-serif;text-align:center;padding:20px;border:1px solid #eee;border-radius:10px;">
            <h2 style="color:#2563eb;">Welcome to Inanst 🚀</h2>
            <p style="color:#666;">Use the code below to verify your email:</p>
            <h1 style="letter-spacing:10px;font-size:40px;color:#111;background:#f8fafc;display:inline-block;padding:10px 20px;border-radius:8px;">${otp}</h1>
            <p style="color:#999;font-size:12px;margin-top:20px;">This code expires in 10 minutes.</p>
          </div>
        `
      );
    } catch (mailError) {
      console.error("Non-fatal Mail Error during registration:", mailError.message);
    }

    return res.status(201).json({
      msg: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: false
      }
    });

  } catch (err) {
    console.error("Fatal Registration Error:", err);
    return res.status(500).json({ msg: "Server error during registration" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server error during login" });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ msg: "Email and code required" });
    }

    const user = await User.findOne({
      email,
      verificationToken: code,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      msg: "Email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true
      }
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server error during verification" });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Email required" });

    if (!canSendOTP(email)) {
      return res.status(429).json({ msg: "Too many requests. Try again later." });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ msg: "Already verified" });
    }

    const otp = generateOTP();
    user.verificationToken = otp;
    user.verificationExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    try {
      await sendEmail(
        user.email,
        "New Verification Code",
        `
          <div style="font-family:sans-serif;text-align:center;padding:20px;">
            <h2>Your new OTP</h2>
            <h1 style="letter-spacing:10px;font-size:40px;background:#f0f9ff;padding:10px;display:inline-block;">${otp}</h1>
            <p>Expires in 10 minutes</p>
          </div>
        `
      );
    } catch (mailError) {
      console.error("Resend Mail Error:", mailError.message);
      return res.status(500).json({ msg: "Could not send email. Please try again later." });
    }

    return res.json({ msg: "New code sent successfully" });

  } catch (err) {
    return res.status(500).json({ msg: "Server error during resend" });
  }
};

//  COMMONJS EXPORTS
module.exports = {
  register,
  login,
  verifyCode,
  resendVerification
};

/*
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const otpRateLimit = new Map();

const canSendOTP = (email) => {
  const now = Date.now();
  const record = otpRateLimit.get(email);

  if (!record) {
    otpRateLimit.set(email, { count: 1, time: now });
    return true;
  }

  // reset after 60 seconds
  if (now - record.time > 60 * 1000) {
    otpRateLimit.set(email, { count: 1, time: now });
    return true;
  }

  if (record.count >= 3) return false;

  record.count++;
  otpRateLimit.set(email, record);
  return true;
};

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, phone, country } = req.body;

    if (!fullName || !email || !password || !phone || !country) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ msg: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; 

    if (user && !user.isVerified) {
      user.name = fullName;
      user.password = hashedPassword;
      user.phone = phone;
      user.country = country;
      user.verificationToken = otp;
      user.verificationExpires = expires;
      await user.save();
    } else {
      user = await User.create({
        name: fullName,
        email,
        phone,
        country,
        password: hashedPassword,
        verificationToken: otp,
        verificationExpires: expires,
        role: "regular",
        isVerified: false
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    try {
      await sendEmail(
        user.email,
        "Verify your Inanst Account",
        `
          <div style="font-family:sans-serif;text-align:center;padding:20px;border:1px solid #eee;border-radius:10px;">
            <h2 style="color:#2563eb;">Welcome to Inanst 🚀</h2>
            <p style="color:#666;">Use the code below to verify your email:</p>
            <h1 style="letter-spacing:10px;font-size:40px;color:#111;background:#f8fafc;display:inline-block;padding:10px 20px;border-radius:8px;">${otp}</h1>
            <p style="color:#999;font-size:12px;margin-top:20px;">This code expires in 10 minutes.</p>
          </div>
        `
      );
    } catch (mailError) {
      console.error("Non-fatal Mail Error during registration:", mailError.message);
    }

    return res.status(201).json({
      msg: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email, // Added email field
        role: user.role,
        isVerified: false
      }
    });

  } catch (err) {
    console.error("Fatal Registration Error:", err);
    return res.status(500).json({ msg: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email, // Added email field
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server error during login" });
  }
};

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ msg: "Email and code required" });
    }

    const user = await User.findOne({
      email,
      verificationToken: code,
      verificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationExpires = null;

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      msg: "Email verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email, // Added email field
        role: user.role,
        isVerified: true
      }
    });

  } catch (err) {
    return res.status(500).json({ msg: "Server error during verification" });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Email required" });

    if (!canSendOTP(email)) {
      return res.status(429).json({ msg: "Too many requests. Try again later." });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ msg: "Already verified" });
    }

    const otp = generateOTP();
    user.verificationToken = otp;
    user.verificationExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    try {
      await sendEmail(
        user.email,
        "New Verification Code",
        `
          <div style="font-family:sans-serif;text-align:center;padding:20px;">
            <h2>Your new OTP</h2>
            <h1 style="letter-spacing:10px;font-size:40px;background:#f0f9ff;padding:10px;display:inline-block;">${otp}</h1>
            <p>Expires in 10 minutes</p>
          </div>
        `
      );
    } catch (mailError) {
      console.error("Resend Mail Error:", mailError.message);
      return res.status(500).json({ msg: "Could not send email. Please try again later." });
    }

    return res.json({ msg: "New code sent successfully" });

  } catch (err) {
    return res.status(500).json({ msg: "Server error during resend" });
  }
};
*/