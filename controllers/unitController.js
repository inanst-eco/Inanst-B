const User = require('../models/User'); 
const School = require('../models/School');
const Service = require('../models/Service');
const Internship = require('../models/Internship');
const Partnership = require('../models/Partnership');
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const Comment = require('../models/Comment');

const getOversightStats = async (req, res) => {
    try {
        //  Get the date for 7 days ago to calculate growth
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        //  Execute all queries
        const [
            totalUsers,
            totalWorkers,
            totalInstructors,
            totalSchools,
            totalServices,
            totalInternships,
            totalPartnerships,
            totalContacts,
            totalNewsletter,
            totalComments,
            pendingEnrollments,
            recentUsers 
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'worker' }),
            User.countDocuments({ role: 'instructor' }),
            School.countDocuments(),
            Service.countDocuments(),
            Internship.countDocuments(),
            Partnership.countDocuments(),
            Contact.countDocuments(),
            Newsletter.countDocuments(),
            Comment.countDocuments(),
            User.countDocuments({ enrollmentStatus: 'pending' }),
            User.find({ createdAt: { $gte: sevenDaysAgo } }).select('createdAt')
        ]);

        //  Process Growth Chart Data (Grouping by Day)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const growthMap = {};
        
        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            growthMap[days[d.getDay()]] = 0;
        }

        // Fill with real user signup counts
        recentUsers.forEach(user => {
            const dayName = days[new Date(user.createdAt).getDay()];
            if (growthMap[dayName] !== undefined) growthMap[dayName]++;
        });

        const growthChart = Object.keys(growthMap).map(label => ({
            label,
            value: growthMap[label]
        }));

        //  Final Response Structure
        const stats = {
            mainStats: {
                workers: totalWorkers,
                users: totalUsers,
                instructors: totalInstructors,
                visitorRate: totalUsers > 0 ? ((recentUsers.length / totalUsers) * 100).toFixed(1) : 0,
            },
            operational: {
                schools: totalSchools,
                services: totalServices,
                newsletter: totalNewsletter,
                contacts: totalContacts,
                internships: totalInternships,
                partnerships: totalPartnerships,
                collabs: totalPartnerships, 
                exams: totalSchools,        
                comments: totalComments
            },
            oversight: {
                pendingEnrollments: pendingEnrollments,
                avgEngagement: [
                    { _id: 'worker', avgSessionDuration: 0 }, 
                    { _id: 'instructor', avgSessionDuration: 0 }
                ]
            },
            growthChart: growthChart
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Database Sync Failed",
            error: error.message
        });
    }
};

module.exports = { getOversightStats };