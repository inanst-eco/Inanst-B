//Inanst-B/controllers/NewsletterController.js



const Newsletter = require('../models/Newsletter');

const subscribeToNewsletter = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: "Email is required" });
    }

    try {
        // Check if already exists
        const existing = await Newsletter.findOne({ email });
        if (existing) {
            return res.status(400).json({ msg: "You are already subscribed!" });
        }

        const newSubscriber = new Newsletter({ email });
        await newSubscriber.save();

        res.status(201).json({ msg: "Thank you for subscribing to our newsletter!" });
    } catch (error) {
        console.error("Newsletter Error:", error);
        res.status(500).json({ msg: "Server error, please try again later." });
    }
};

module.exports = { subscribeToNewsletter };