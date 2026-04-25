const User = require('../models/User');
const Activity = require('../models/Activity'); 
const Enrollment = require('../models/enrollmentModel');
const Newsletter = require('../models/Newsletter'); 

const getAdminOversightStats = async (req, res) => {
    try {
        
        const [students, workers, instructors, regulars, newsletterCount] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'worker' }),
            User.countDocuments({ role: 'instructor' }),
            User.countDocuments({ role: 'regular' }), 
            Newsletter.countDocuments() 
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const [visitorsToday, visitorsYesterday] = await Promise.all([
            Activity.distinct('userId', { timestamp: { $gte: today } }),
            Activity.distinct('userId', { timestamp: { $gte: yesterday, $lt: today } })
        ]);

        const todayCount = visitorsToday.length;
        const yesterdayCount = visitorsYesterday.length;
        
        let visitorRate = 0;
        if (yesterdayCount > 0) {
            visitorRate = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
        } else if (todayCount > 0) {
            visitorRate = 100; 
        }

        const activityStats = await Activity.aggregate([
            {
                $group: {
                    _id: "$role",
                    avgSessionDuration: { $avg: "$metadata.duration" },
                    totalLogins: { $sum: { $cond: [{ $eq: ["$action", "login"] }, 1, 0] } }
                }
            }
        ]);

        const [pendingResponses, pendingEnrollments] = await Promise.all([
            Activity.countDocuments({ action: 'worker_response', status: 'pending' }),
            Enrollment.countDocuments({ status: 'pending' })
        ]);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const growthData = await User.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%a", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "createdAt": 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                mainStats: {
                    users: students + regulars, 
                    workers: workers,
                    instructors: instructors,
                    visitorRate: visitorRate.toFixed(1), 
                    visitorsToday: todayCount
                },
                operational: {
                    newsletter: newsletterCount,
                    contacts: 0, 
                    internships: 0
                },
                oversight: {
                    workerResponses: pendingResponses,
                    pendingEnrollments: pendingEnrollments,
                    avgEngagement: activityStats
                },
                growthChart: growthData.map(d => ({ label: d._id, value: d.count }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "System Monitor Error: " + error.message });
    }
};

// Logic for Role Management
const updateUserRole = async (req, res) => {
    const { userId, newRole } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
        res.status(200).json({ success: true, user, message: `Role updated to ${newRole}` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Promotion/Depromotion failed" });
    }
};

//  Delete User Logic
const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        await User.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: "User account deleted permanently" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Deletion failed" });
    }
};

module.exports = {
    getAdminOversightStats,
    updateUserRole,
    deleteUser
};