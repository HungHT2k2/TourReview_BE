import recipeModel from "../models/tourModel.js";
import commonModel from "../models/commonModel.js";
class commonServices {
    getAllCommon = async (req, res, next) => {
        try {
            
            const allCommon = await commonModel.find({key:"country"},{_id : 0,key:0,__v:0,createAt:0,updatedAt:0  });
            return allCommon;
        } catch (err) {
            return err;
        }

    } 
    createCommon = async (req, res, next) => {
        try {
            const {key,label,value} = req.body;
            const allCommon = await commonModel.create({key,label,value});
            return allCommon;
        } catch (err) {
            return err;
        }

    }
}

export default new commonServices