const Contact = require('../models/Contact');

const sendContactMessage = async (req, res) => {
    const { fullName, email, phoneNumber, title, message } = req.body;

    if (!fullName || !email || !message) {
        return res.status(400).json({ msg: "Please fill in all required fields." });
    }

    try {
        const newMessage = new Contact({
            fullName,
            email,
            phoneNumber,
            title,
            message
        });

        await newMessage.save();
        res.status(201).json({ msg: "Message sent successfully! We will get back to you soon." });
    } catch (error) {
        console.error("Contact API Error:", error);
        res.status(500).json({ msg: "Server error. Please try again later." });
    }
};

module.exports = { sendContactMessage };