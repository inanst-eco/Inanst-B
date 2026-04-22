const { Enrollment } = require('../models/enrollmentModel');
const User = require('../models/User'); 
// Ensure this model points to your actual newsletter collection
const Newsletter = require('../models/newsletterModel'); 

exports.getDashboardStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const [
            enrollments,
            payments,
            liveUsers,
            newsletterCount, // Updated variable name
            internships,
            partnerships,
            exams,
            comments,
            recentEnrollmentsRaw,
            growthData
        ] = await Promise.all([
            // Counts for main metrics
            Enrollment.countDocuments({ paymentStatus: 'pending' }),
            Enrollment.countDocuments({ paymentStatus: 'failed' }), 
            User.countDocuments({ isLive: true }), 
            
            // FIX: Query the specific Newsletter collection instead of User.subscribed
            Newsletter.countDocuments(),
            
            Enrollment.countDocuments({ selectedItems: 'internship' }), 
            Enrollment.countDocuments({ selectedItems: 'partnership' }),
            Enrollment.countDocuments({ selectedItems: 'exam' }),
            User.countDocuments({ "comments.0": { "$exists": true } }),

            // Fetch recent items
            Enrollment.find()
                .select('fullName paymentStatus createdAt') 
                .sort({ createdAt: -1 })
                .limit(5),

            // Aggregate growth data
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

        // Map DB fields to match the Frontend UI property names
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
                    newsletter: newsletterCount || 0, //  DB
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
        console.error("Hi Wasem, API Error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};