const Internship = require('../models/Internship');
const { Resend } = require('resend');

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

exports.getInternships = async (req, res) => {
    try {
        
        const filter = req.query.email ? { email: req.query.email } : {};
        
       
        const apps = await Internship.find(filter).sort({ createdAt: -1 });
        
        const figures = {
            total: apps.length,
            pending: apps.filter(a => a.status === 'pending').length,
            accepted: apps.filter(a => a.status === 'accepted').length,
            denied: apps.filter(a => a.status === 'denied').length
        };

        res.status(200).json({ success: true, count: apps.length, figures, data: apps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.applyForInternship = async (req, res) => {
    try {
        const application = await Internship.create(req.body);
        res.status(201).json({ success: true, data: application });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const app = await Internship.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true, runValidators: true }
        );
        
        if (!app) return res.status(404).json({ success: false, message: "Not found" });

        // EMAIL LOGIC VIA RESEND
        if (status === 'accepted') {
            await resend.emails.send({
                from: 'Inanst Hub <onboarding@inanst.com>', 
                to: app.email,
                subject: 'Internship Application Accepted!',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; color: #1a1f2e;">
                        <h1 style="color: #2563eb;">Congratulations, ${app.name}!</h1>
                        <p>We are excited to inform you that your application for the <strong>${app.roleTitle}</strong> internship has been <strong>Accepted</strong>.</p>
                        <p>To begin your journey, please log in to your dashboard. If you are already logged in, please <strong>refresh the page</strong> to unlock your Intern Portal and tasks.</p>
                        <hr style="border: 1px solid #f3f4f6; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #6b7280;">This is an automated message from the Inanst Creative Digital Hub management system.</p>
                    </div>
                `
            });
        }
        
        res.status(200).json({ success: true, data: app });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


exports.endInternship = async (req, res) => {
    try {
      
        const app = await Internship.findByIdAndUpdate(
            req.params.id,
            { status: 'ended' },
            { new: true }
        );

        if (!app) return res.status(404).json({ success: false, message: "Internship record not found" });

        res.status(200).json({ success: true, message: "Internship ended successfully", data: app });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};