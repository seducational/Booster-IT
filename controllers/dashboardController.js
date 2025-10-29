import User from '../models/User.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await User.countDocuments();

        // Get users registered in the last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const activeUsers = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Get today's registrations
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRegistrations = await User.countDocuments({
            createdAt: { $gte: today }
        });

        // Get this week's registrations
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyRegistrations = await User.countDocuments({
            createdAt: { $gte: weekAgo }
        });

        // Get daily signups for the past week
        const dailySignups = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: weekAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                todayRegistrations,
                weeklyRegistrations,
                dailySignups
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
};

// Get users list with filtering and pagination
export const getUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status,
            dateFilter,
            sort = 'recent'
        } = req.query;

        // Build query
        const query = {};
        
        // Search filter
        if (search) {
            query.email = new RegExp(search, 'i');
        }

        // Status filter
        if (status && status !== 'All') {
            query.isVerified = status === 'Active';
        }

        // Date filter
        if (dateFilter) {
            const dateFilters = {
                '7days': 7,
                '30days': 30,
                '90days': 90
            };
            const days = dateFilters[dateFilter];
            if (days) {
                query.createdAt = {
                    $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                };
            }
        }

        // Sort options
        const sortOptions = {
            recent: { createdAt: -1 },
            oldest: { createdAt: 1 }
        };

        // Execute query with pagination
        const users = await User.find(query)
            .sort(sortOptions[sort])
            .skip((page - 1) * limit)
            .limit(limit)
            .select('email createdAt isVerified serviceBooked');

        // Get total count for pagination
        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users.map(user => ({
                id: user._id,
                email: user.email,
                registrationDate: user.createdAt,
                status: user.isVerified ? 'Active' : 'Inactive',
                plan: user.serviceBooked || 'Free'
            })),
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Users List Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users list'
        });
    }
};

// Get single user details
export const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                registrationDate: user.createdAt,
                status: user.isVerified ? 'Active' : 'Inactive',
                serviceBooked: user.serviceBooked,
                expectedResponse: user.expectedResponse,
                bookingId: user.bookingId
            }
        });
    } catch (error) {
        console.error('User Details Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user details'
        });
    }
};