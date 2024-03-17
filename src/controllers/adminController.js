import User from '../models/userModel.js';
import Tour from '../models/tourModel.js';
import moment from 'moment';

class AdminController {
    async getUsers(req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const search = req.query.search || "";
            const sort = req.query.sort || '-createdAt';
            const users = await User.find({
                $and: [
                    {
                        $or: [
                            { name: { $regex: search, $options: 'i' } }, // case-insensitive search
                            { email: { $regex: search, $options: 'i' } }
                        ]
                    },
                    { _id: { $ne: req.user._id } } // exclude the user with the specified _id
                ]
            }).sort(sort).skip((page - 1) * limit).limit(limit);
            return res.status(200).json({ users: users });
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    async getTours(req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const search = req.query.search || "";
            const sort = req.query.sort || '-createdAt';
            const tours = await Tour.find({
                $or: [
                    { name: { $regex: search } }
                ]
            }).populate("owner").sort(sort).skip((page - 1) * limit).limit(limit);
            return res.status(200).json({ tours: tours });
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    async dashboardDetail(req, res) {
        try {
            const totalUser = await User.countDocuments();
            const totalTour = await Tour.countDocuments();
            const totalReviewer = await User.countDocuments({ role: "reviewer" });

            const newUser = await User.find();
            const newTour = await Tour.find().sort({ createdAt: -1 }).limit(5);

            const currentMonthStart = moment().startOf('month');
            const currentMonthEnd = moment().endOf('month');
            const daysInMonth = moment().daysInMonth();

            const newUserCounts = Array.from({ length: daysInMonth }, () => 0);
            const newTourCounts = Array.from({ length: daysInMonth }, () => 0);

            const newUsers = await User.find({
                createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
            });

            const newTours = await Tour.find({
                createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
            });

            newUsers.forEach(user => {
                const day = moment(user.createdAt).date();
                newUserCounts[day - 1]++;
            });

            newTours.forEach(tour => {
                const day = moment(tour.createdAt).date();
                newTourCounts[day - 1]++;
            });

            return res.status(200).json({
                totalUser,
                totalTour,
                totalReviewer,
                newUser,
                newTour,
                newUserCounts,
                newTourCounts
            });
        } catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    async updateTourStatus(req,res){
        try {
            const {id} = req.params;
            const tour = await Tour.findById(id);
            if(tour){
                let newStatus = 'active';
                if(tour.status === 'active'){
                    newStatus = 'inactive';
                }
                await Tour.findByIdAndUpdate(id,{
                    status:newStatus
                })
            }
            return res.status(200).json({msg:"Update status successfully!"});
        } catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

}

export default new AdminController;