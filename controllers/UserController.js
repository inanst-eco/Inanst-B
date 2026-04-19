//Inanst-B/controllers/UserController.js


const User = require('../models/User');

const getUserProfile = async (req, res) => {
  try {
    
    const userId = req.user.user?.id || req.user.id;

    const user = await User.findById(userId).select('fullName email bio');

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