import recipeModel from "../models/tourModel.js";
import userModel from "../models/userModel.js";
class RecipeServices {
    getAllRecipe = async (req, res, next) => {
        try {
            const allRecipe = await recipeModel.find({});
            return allRecipe;
        } catch (err) {
            return err;
        }

    }

        findByOwner = async (req, res, next) => {
            const userId = req.user._id;
            try {
                const recipe = await recipeModel.find({ owner: userId });
                return recipe;
            } catch (err) {
                return err;
            }
        }


    findByID = async (req, res, next) => {
        const { id } = req.params;
        if (!id) {
            return next();
        }
        try {
            const recipe = await recipeModel.findById(id).populate("owner")
            return recipe;
        } catch (err) {
            return err;
        }
    }

    Create = async (req, res, next) => {
        try {
            const { name, introduction, recipes, tags } = req.body
            const userId = req.user._id;
            const create = await recipeModel.create({ name, introduction, recipes, tags, owner: userId });
            const updateUser = await userModel.findById(userId).then((user) => {
                user.role ="chief";
                user.ownerRecipes.push(create._id);
                user.save();
            });
            return {
                create, updateUser
            }
        } catch (error) {
            return error;
        }

    }

    Update = async (req, res, next) => {
        const { id } = req.params;
        try {
            const recipeUpdate = await recipeModel.findById(id).exec();
            if (!recipeUpdate) {
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        error: "Recipe not found"
                    }
                };
            }
            const result = await recipeModel.findOneAndUpdate({ _id: id }, req.body);
            return {
                data: {
                    statusCode: 200,
                    success: true,
                    result
                }
            };
        } catch (err) {
            return err;
        }
    }

    Delete = async (req, res, next) => {
        const { id } = req.params;
        try {
            const recipeUpdate = await recipeModel.findById(id).exec();
            if (!recipeUpdate) {
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        error: "Recipe not found"
                    }
                };
            }
            const userId = req.user._id;
            await userModel.findById(userId).then((user) => {
                const result = user.ownerRecipes.filter((recipe) => JSON.stringify(recipe._id) !== JSON.stringify(id));
                user.ownerRecipes = result;
                if(user.ownerRecipes.length == 0) {
                    user.role = "user";
                }
                user.save();
            });
            const result = await recipeModel.findOneAndDelete({ _id: id }, req.body);
            
            return {
                data: {
                    statusCode: 200,
                    success: true,
                    result
                }
            };
        } catch (err) {
            return err;
        }
    }
    search = async (condition) => {
        const recipes = await recipeModel.find(condition);
        return recipes;
    }
    getFavorite = async (req, res, next) => {
        const { page = 1, limit = 10 } = req.query;
        
        const recipes = await recipeModel.aggregate([
          {
            $addFields: {
              favorites_size: { $size: { $ifNull: ["$favorites", []] } },
            },
          },
          { $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "users"
         }},
          {
            $sort: { favorites_size: -1 },
          },
          { $skip: (page - 1) * limit },
          { $limit: +limit },
          
        ]);
        return recipes;
      };
      getNew = async (req, res, next) => {
        const { page = 1, limit = 10 } = req.query;
        const recipes = await recipeModel.aggregate([
          {
            $addFields: {
              favorites_size: { $size: { $ifNull: ["$favorites", []] } },
            },
          },
          { $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "users"
         }},
          {
            $sort: { createdAt: -1 },
          },
          { $skip: (page - 1) * limit },
          { $limit: +limit },
        
        ])
        return recipes;
      };

}

export default new RecipeServices