const User = require('../models/User');


const getUserProfile = async (req, res) => {
  try {
    // req.user.id is populated by 'protect' middleware
    const user = await User.findById(req.user.id).select('fullName email bio role');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = { getUserProfile };