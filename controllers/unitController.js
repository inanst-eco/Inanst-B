const User = require('../models/User'); 
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const Comment = require('../models/comment');
const Service = require('../models/Service');
const Internship = require('../models/Internship');
const { Enrollment } = require('../models/enrollmentModel'); 

const getOversightStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            totalUsers,
            totalWorkers,
            totalInstructors,
            totalContacts,
            totalNewsletter,
            totalComments,
            totalServices,
            totalInternships,
            pendingEnrollments,
            growthData 
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'worker' }),
            User.countDocuments({ role: 'instructor' }),
            Contact.countDocuments(),
            Newsletter.countDocuments(),
            Comment.countDocuments(),
            Service.countDocuments(),
            Internship.countDocuments(),
            Enrollment.countDocuments({ paymentStatus: 'pending' }),
            
            
            User.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ])
        ]);

        
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayData = growthData.find(item => item._id === dateStr);
            
            last7Days.push({
                label: date.toLocaleDateString('en-US', { weekday: 'short' }), 
                value: dayData ? dayData.count : 0
            });
        }

        
        const recentSignupsCount = growthData.reduce((acc, curr) => acc + curr.count, 0);
        const visitorRate = totalUsers > 0 ? ((recentSignupsCount / totalUsers) * 100).toFixed(1) : 0;

        const stats = {
            mainStats: {
                workers: totalWorkers || 0,
                users: totalUsers || 0,
                instructors: totalInstructors || 0,
                visitorRate: visitorRate,
            },
            operational: {
                schools: 0, 
                services: totalServices || 0,
                newsletter: totalNewsletter || 0,
                contacts: totalContacts || 0,
                internships: totalInternships || 0,
                partnerships: 0, 
                collabs: 0, 
                exams: 0,   
                comments: totalComments || 0
            },
            oversight: {
                pendingEnrollments: pendingEnrollments || 0,
                avgEngagement: [
                    { _id: 'worker', avgSessionDuration: 0 },
                    { _id: 'instructor', avgSessionDuration: 0 }
                ]
            },
            growthChart: last7Days 
        };

        res.status(200).json({ success: true, data: stats });

    } catch (error) {
        console.error("Admin Dashboard Error:", error);
        res.status(500).json({
            success: false,
            message: "System Oversight Sync Error",
            error: error.message
        });
    }
};

module.exports = { getOversightStats };