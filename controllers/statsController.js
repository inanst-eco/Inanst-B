const { Enrollment } = require('../models/enrollmentModel');
const User = require('../models/User'); 

exports.getDashboardStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            enrollments,
            payments,
            liveUsers,
            newsletter,
            internships,
            partnerships,
            exams,
            comments,
            recentEnrollments,
            growthData
        ] = await Promise.all([
            // Use the fields we defined in your final Enrollment model
            Enrollment.countDocuments({ paymentStatus: 'pending' }),
            Enrollment.countDocuments({ paymentStatus: 'failed' }), 
            User.countDocuments({ isLive: true }), 
            
            User.countDocuments({ subscribed: true }),
            Enrollment.countDocuments({ selectedItems: 'internship' }), 
            Enrollment.countDocuments({ selectedItems: 'partnership' }),
            Enrollment.countDocuments({ selectedItems: 'exam' }),
            User.countDocuments({ "comments.0": { "$exists": true } }),

            Enrollment.find()
                .select('fullName paymentStatus createdAt') // Changed studentName to fullName to match model
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
                    newsletter: newsletter || 0,
                    contacts: 0,
                    internships: internships || 0,
                    partnerships: partnerships || 0,
                    exams: exams || 0,
                    comments: comments || 0
                },
                recentEnrollments,
                growthChart: growthData.map(item => ({
                    label: new Date(item._id).toLocaleDateString('en-US', { weekday: 'short' }),
                    value: item.count
                }))
            }
        });
    } catch (error) {
        console.error("Hi Wasem, API Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};