const { Enrollment } = require('../models/enrollmentModel');
const User = require('../models/User'); 
const Newsletter = require('../models/Newsletter'); 
const Contact = require('../models/Contact'); 
const Activity = require('../models/Activity'); 

exports.getAdminOversightStats = async (req, res) => {
    try {
        // Setup date range for the last 7 days (Reuse logic)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            students,
            regulars,
            workers,
            instructors,
            newsletterCount,
            contacts,
            pendingEnrollments,
            internships,
            partnerships,
            exams,
            comments,
            activityStats,
            growthDataRaw
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'regular' }),
            User.countDocuments({ role: 'worker' }),
            User.countDocuments({ role: 'instructor' }),
            Newsletter.countDocuments(),
            Contact.countDocuments(),
            Enrollment.countDocuments({ status: 'pending' }),
            
           
            Enrollment.countDocuments({ selectedItems: 'internship' }), 
            Enrollment.countDocuments({ selectedItems: 'partnership' }),
            Enrollment.countDocuments({ selectedItems: 'exam' }),
            
            
            User.countDocuments({ "comments.0": { "$exists": true } }),

            
            Activity.aggregate([
                { $group: { _id: "$role", avgSessionDuration: { $avg: "$metadata.duration" } } }
            ]),

            // Chart Data 
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
            const dayData = growthDataRaw.find(item => item._id === dateStr);
            
            last7Days.push({
                label: date.toLocaleDateString('en-US', { weekday: 'short' }), 
                value: dayData ? dayData.count : 0
            });
        }

        res.status(200).json({
            success: true,
            data: {
                mainStats: {
                    workers: workers || 0,
                    users: students + regulars,
                    instructors: instructors || 0,
                    visitorRate: "12.5", 
                },
                operational: {
                    newsletter: newsletterCount || 0,
                    contacts: contacts || 0,
                    internships: internships || 0,
                    partnerships: partnerships || 0,
                    exams: exams || 0,
                    comments: comments || 0,
                    collabs: 0 
                },
                oversight: {
                    pendingEnrollments: pendingEnrollments,
                    avgEngagement: activityStats
                },
                growthChart: last7Days 
            }
        });
    } catch (error) {
        console.error("Dashboard API Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};