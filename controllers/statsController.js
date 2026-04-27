//Inanst-B/controllers/statsController.js

const { Enrollment } = require('../models/enrollmentModel');
const User = require('../models/User'); 
const Newsletter = require('../models/Newsletter'); 

exports.getDashboardStats = async (req, res) => {
    try {
        // Setup date range for the last 7 days
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            enrollments,
            payments,
            registeredUsers,
            newsletterCount,
            internships,
            partnerships,
            exams,
            comments,
            recentEnrollmentsRaw,
            growthData
        ] = await Promise.all([
            Enrollment.countDocuments({ paymentStatus: 'pending' }),
            Enrollment.countDocuments({ paymentStatus: 'failed' }), 
            User.countDocuments({}), 
            Newsletter.countDocuments(), 
            Enrollment.countDocuments({ selectedItems: 'internship' }), 
            Enrollment.countDocuments({ selectedItems: 'partnership' }),
            Enrollment.countDocuments({ selectedItems: 'exam' }),
            User.countDocuments({ "comments.0": { "$exists": true } }),

            Enrollment.find()
                .select('fullName paymentStatus createdAt') 
                .sort({ createdAt: -1 })
                .limit(5),

            //  Group by day for the chart
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

        //  Logic to fill in missing days with 0 
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

        const recentEnrollments = recentEnrollmentsRaw.map(enrollment => ({
            _id: enrollment._id,
            studentName: enrollment.fullName,
            status: enrollment.paymentStatus,
            createdAt: enrollment.createdAt
        }));

        res.status(200).json({
            success: true,
            data: {
                mainStats: {
                    enrollments: enrollments || 0,
                    payments: payments || 0,
                    supports: 0,
                    live: registeredUsers || 0,
                },
                operational: {
                    newsletter: newsletterCount || 0,
                    contacts: 0,
                    internships: internships || 0,
                    partnerships: partnerships || 0,
                    exams: exams || 0,
                    comments: comments || 0,
                    collabs: 0
                },
                recentEnrollments,
                growthChart: last7Days 
            }
        });
    } catch (error) {
        console.error("Hi Wasem, API Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};