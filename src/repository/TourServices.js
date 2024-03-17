import tourModel from "../models/tourModel.js";
import userModel from "../models/userModel.js";
class TourServices {
    getAllTour = async (req, res, next) => {
        try {
            const allTour = await tourModel.find({});
            return allTour;
        } catch (err) {
            return err;
        }

    }

        findByOwner = async (req, res, next) => {
            const userId = req.user._id;
            try {
                const tour = await tourModel.find({ owner: userId });
                return tour;
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
            const tour = await tourModel.findById(id).populate("owner")
            return tour;
        } catch (err) {
            return err;
        }
    }

    Create = async (req, res, next) => {
        try {
            const { name, introduction, tours, tags } = req.body
            const userId = req.user._id;
            const create = await tourModel.create({ name, introduction, tours, tags, owner: userId });
            const updateUser = await userModel.findById(userId).then((user) => {
                user.role ="reviewer";
                user.ownerTours.push(create._id);
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
            const tourUpdate = await tourModel.findById(id).exec();
            if (!tourUpdate) {
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        error: "Tour not found"
                    }
                };
            }
            const result = await tourModel.findOneAndUpdate({ _id: id }, req.body);
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
            const tourUpdate = await tourModel.findById(id).exec();
            if (!tourUpdate) {
                return {
                    data: {
                        statusCode: 400,
                        success: false,
                        error: "Tour not found"
                    }
                };
            }
            const userId = req.user._id;
            await userModel.findById(userId).then((user) => {
                const result = user.ownerTours.filter((tour) => JSON.stringify(tour._id) !== JSON.stringify(id));
                user.ownerTours = result;
                if(user.ownerTours.length == 0) {
                    user.role = "user";
                }
                user.save();
            });
            const result = await tourModel.findOneAndDelete({ _id: id }, req.body);
            
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
        const tours = await tourModel.find(condition);
        return tours;
    }
    getFavorite = async (req, res, next) => {
        const { page = 1, limit = 10 } = req.query;
        
        const tours = await tourModel.aggregate([
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
        return tours;
      };
      getNew = async (req, res, next) => {
        const { page = 1, limit = 10 } = req.query;
        const tours = await tourModel.aggregate([
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
        return tours;
      };

}

export default new TourServices