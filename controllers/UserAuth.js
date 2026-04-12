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

    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ msg: "User already exists. Please login." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otpCode = generateOTP();
    const otpExpires = Date.now() + 24 * 60 * 60 * 1000; 

    if (user && !user.isVerified) {
      user.name = fullName; 
      user.password = hashedPassword;
      user.phone = phone;
      user.country = country;
      user.verificationToken = otpCode;
      user.verificationExpires = otpExpires;
      await user.save();
    } else {
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

    // Generate token so they are logged in immediately after registration
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Welcome to Inanst!</h2>
        <p>Hi ${fullName}, please verify your account using this code:</p>
        <h1 style="letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px; display: inline-block;">${otpCode}</h1>
        <p>You can also verify this later from your dashboard.</p>
      </div>
    `;

    //  Send email without making the user wait
    sendEmail(user.email, "Verify your Inanst Account", message).catch(err => 
      console.error("Background Email Error:", err.message)
    );

    return res.status(201).json({ 
      msg: "Registration successful", 
      token,
      user: { id: user._id, name: user.name, role: user.role, isVerified: false } 
    });

  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({ msg: "Server Error during registration" });
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
      user: { id: user._id, name: user.name, role: user.role, isVerified: true }
    });
  } catch (err) {
    return res.status(500).json({ msg: "Server error during verification" });
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

    const message = `<p>Your new verification code is: <b>${newOtp}</b></p>`;

    sendEmail(user.email, "New Inanst Verification Code", message).catch(e => console.error(e));
    
    return res.json({ msg: "New code sent to email" });
  } catch (err) {
    return res.status(500).json({ msg: "Server error during OTP resend" });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ msg: "User not found" });
    
    const newOtp = generateOTP();
    user.verificationToken = newOtp;
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const message = `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Verify your account</h2>
        <p>Your verification code is: <b>${newOtp}</b></p>
      </div>
    `;
    
    sendEmail(user.email, "Inanst Verification Link", message).catch(e => console.error(e));

    return res.json({ msg: "Verification code resent!" });
  } catch (err) {
    res.status(500).json({ msg: "Error resending code" });
  }
};