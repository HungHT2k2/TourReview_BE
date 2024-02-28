import recipeModel from "../models/tourModel.js";
import commonModel from "../models/commonModel.js";
import RecipeServices from "../repository/RecipeServices.js";
import commonServices from "../repository/commonServices.js";

class RecipeController {
    getAllrecipe = async (req, res, next) => {
        const allRecipe = await RecipeServices.getAllRecipe(req, res, next)
        return res.send({
            status: 200,
            allRecipe
        })
    }

    getrecipeByID = async (req, res, next) => {
        const recipe = await RecipeServices.findByID(req, res, next);
        return res.send({
            status: 200,
            recipe
        })
    }




    getRecipeByOwner = async (req, res, next) => {
        const recipe = await RecipeServices.findByOwner(req, res, next);
        return res.send({
            status: 200,
            recipe
        })
    }

    createRecipe = async (req, res, next) => {
        const newRecipe = await RecipeServices.Create(req, res, next);
        if (!newRecipe) {
            return res.status(400).send({
                status: "failed to create recipe",
            })
        }
        return res.status(200).send({
            data: newRecipe
        });
    }

    updateByID = async (req, res, next) => {

        try {
            const recipeUpdate = await RecipeServices.Update(req, res, next);
            if (!recipeUpdate) {
                return res.send({
                    status: "failed to Update recipe",
                })
            }
            if (recipeUpdate.data.statusCode !== 201) {
                return res.status(200).send({
                    data: recipeUpdate
                });
            }
            return res.status(201).send({
                success: true,
            })
        } catch (error) {

        }

    }

    deleteByID = async (req, res, next) => {

        try {
            const recipeUpdate = await RecipeServices.Delete(req, res, next);
            if (!recipeUpdate) {
                return res.send({
                    status: "failed to delete recipe",
                })
            }
            if (recipeUpdate.data.statusCode !== 201) {
                return res.status(200).send({
                    data: recipeUpdate
                });
            }
            return res.status(201).send({
                success: true,
            })
        } catch (error) {

        }

    }

    getAllCountry = async (req, res) => {
        try {
            const tags = await recipeModel.find().select('tags');
            let countries = [];
            tags.forEach(item => {
                item.tags.forEach(infor => {
                    if (infor.k === 'country') {
                        countries.push(infor.v);

                    }
                })
                // 
            })

            const finalCountry = new Set(countries);
            console.log(finalCountry)
            return res.status(200).json({
                countries: finalCountry
            })
        }
        catch (err) {
            return res.status(500).json({ message: err.toString() });
        }
    }

    getAllCommon = async (req, res) => {
        const allCommon = await commonServices.getAllCommon(req, res)
        const {label,value} = allCommon;
        const object = {label,value}
        try {
            return res.send(allCommon)
        } catch (error) {
            res.send({ error: error.message });
        }
        
    }

    createCommon = async (req, res) => {
        const allCommon = await commonServices.createCommon(req, res)
        try {
            return res.send(allCommon)
        } catch (error) {
            res.send({ error: error.message });
        }
        
    }
    search = async (req, res) => {
        const { name, type, country } = req.query;
    
        const condition = {};
    
        if (name) {
          condition.name = { $regex: new RegExp(name, "i") };
        }
    
        const typeCondition = {};
        if (type) {
          typeCondition["tags.v"] = { $in: [type] };
        }
    
        const countryCondition = {};
        if (country) {
          countryCondition["tags.v"] = { $in: [country] };
        }
    
        const combinedConditions = {
          $and: [condition, typeCondition, countryCondition],
        };
    
        const recipes = await RecipeServices.search(combinedConditions);
    
        res.json(recipes);
      };
      getFavorite = async (req, res) => {
        try {
          const recipeFavorite = await RecipeServices.getFavorite(req, res)
          const size = await recipeModel.find({});
          return res.status(200).json({
            data: recipeFavorite,
            
            size: size.length,
            success: true,
          });
        } catch (error) {
          return res.status(500).json({ status: false, error: "Error Occurred" });
        }
      };
      getNew = async (req, res) => {
        try {
          const recipeNew = await RecipeServices.getNew(req, res);
          const size = await recipeModel.find({}).populate("owner");
          return res.status(200).json({
            data: recipeNew,
            size: size.length,
            success: true,
          });
        } catch (error) {
          return res.status(500).json({ status: false, error: "Error Occurred" });
        }
      };

}

export default new RecipeController;