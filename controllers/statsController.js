const { Enrollment } = require('../models/enrollmentModel');
const User = require('../models/User'); 

// FIX: Changed from 'newsletterModel' to 'Newsletter' to match your file name
const Newsletter = require('../models/Newsletter'); 

exports.getDashboardStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            enrollments,
            payments,
            liveUsers,
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
            User.countDocuments({ isLive: true }), 
            
            // This will now work because the import above is fixed
            Newsletter.countDocuments(), 
            
            Enrollment.countDocuments({ selectedItems: 'internship' }), 
            Enrollment.countDocuments({ selectedItems: 'partnership' }),
            Enrollment.countDocuments({ selectedItems: 'exam' }),
            User.countDocuments({ "comments.0": { "$exists": true } }),

            Enrollment.find()
                .select('fullName paymentStatus createdAt') 
                .sort({ createdAt: -1 })
                .limit(5),

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
                    live: liveUsers || 0,
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
                growthChart: growthData.map(item => ({
                    label: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
                    value: item.count
                }))
            }
        });
    } catch (error) {
        // Keeping your custom log!
        console.error("Hi Wasem, API Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};