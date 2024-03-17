import User from '../models/userModel.js';
import Recipe from '../models/recipeModel.js';
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

    async getRecipes(req, res) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const search = req.query.search || "";
            const sort = req.query.sort || '-createdAt';
            const recipes = await Recipe.find({
                $or: [
                    { name: { $regex: search } }
                ]
            }).populate("owner").sort(sort).skip((page - 1) * limit).limit(limit);
            return res.status(200).json({ recipes: recipes });
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    async dashboardDetail(req, res) {
        try {
            const totalUser = await User.countDocuments();
            const totalRecipe = await Recipe.countDocuments();
            const totalChief = await User.countDocuments({ role: "chief" });

            const newUser = await User.find();
            const newRecipe = await Recipe.find().sort({ createdAt: -1 }).limit(5);

            const currentMonthStart = moment().startOf('month');
            const currentMonthEnd = moment().endOf('month');
            const daysInMonth = moment().daysInMonth();

            const newUserCounts = Array.from({ length: daysInMonth }, () => 0);
            const newRecipeCounts = Array.from({ length: daysInMonth }, () => 0);

            const newUsers = await User.find({
                createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
            });

            const newRecipes = await Recipe.find({
                createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
            });

            newUsers.forEach(user => {
                const day = moment(user.createdAt).date();
                newUserCounts[day - 1]++;
            });

            newRecipes.forEach(recipe => {
                const day = moment(recipe.createdAt).date();
                newRecipeCounts[day - 1]++;
            });

            return res.status(200).json({
                totalUser,
                totalRecipe,
                totalChief,
                newUser,
                newRecipe,
                newUserCounts,
                newRecipeCounts
            });
        } catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    async updateRecipeStatus(req,res){
        try {
            const {id} = req.params;
            const recipe = await Recipe.findById(id);
            if(recipe){
                let newStatus = 'active';
                if(recipe.status === 'active'){
                    newStatus = 'inactive';
                }
                await Recipe.findByIdAndUpdate(id,{
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