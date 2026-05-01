const School = require('../models/School');
const Student = require('../models/Student');
const Class = require('../models/Class');
const Cohort = require('../models/Cohort');

exports.getInstructorDashboard = async (req, res) => {
    try {
        const [schoolCount, studentCount, activeClasses, activeCohorts] = await Promise.all([
            School.countDocuments(),
            Student.countDocuments(),
            Class.countDocuments({ status: 'active' }),
            Cohort.countDocuments({ isActive: true })
        ]);

        res.status(200).json({
            success: true,
            data: {
                schoolCount,
                studentCount,
                activeClasses,
                activeCohorts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data",
            error: error.message
        });
    }
};