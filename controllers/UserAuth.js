const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
  try {
    //Destructure fullName, phone, and country to match frontend
    const { fullName, email, password, confirmPassword, phone, country } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otpCode = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000; 

    user = new User({
      name: fullName, 
      email,
      phone,
      country,
      password: hashedPassword,
      verificationToken: otpCode,
      verificationExpires: otpExpires
    });

    await user.save();

    const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #2563eb;">Verify Your Inanst Account</h2>
        <p>Hi ${fullName}, your 6-digit verification code is:</p>
        <h1 style="letter-spacing: 5px; color: #1e293b;">${otpCode}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `;

    await sendEmail(user.email, "Inanst Verification Code", message);
    res.status(201).json({ msg: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// VERIFY OTP CODE
exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ 
      email, 
      verificationToken: code,
      verificationExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    // Create token so user is logged in immediately after verification
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({
      msg: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });
    
    if (!user.isVerified) {
      return res.status(401).json({ msg: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};