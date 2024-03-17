import tourModel from "../models/tourModel.js";
import commonModel from "../models/commonModel.js";
import TourServices from "../repository/TourServices.js";
import commonServices from "../repository/commonServices.js";

class TourController {
    getAlltour = async (req, res, next) => {
        const allTour = await TourServices.getAllTour(req, res, next)
        return res.send({
            status: 200,
            allTour
        })
    }

    gettourByID = async (req, res, next) => {
        const tour = await TourServices.findByID(req, res, next);
        return res.send({
            status: 200,
            tour
        })
    }




    getTourByOwner = async (req, res, next) => {
        const tour = await TourServices.findByOwner(req, res, next);
        return res.send({
            status: 200,
            tour
        })
    }

    createTour = async (req, res, next) => {
        const newTour = await TourServices.Create(req, res, next);
        if (!newTour) {
            return res.status(400).send({
                status: "failed to create tour",
            })
        }
        return res.status(200).send({
            data: newTour
        });
    }

    updateByID = async (req, res, next) => {

        try {
            const tourUpdate = await TourServices.Update(req, res, next);
            if (!tourUpdate) {
                return res.send({
                    status: "failed to Update tour",
                })
            }
            if (tourUpdate.data.statusCode !== 201) {
                return res.status(200).send({
                    data: tourUpdate
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
            const tourUpdate = await TourServices.Delete(req, res, next);
            if (!tourUpdate) {
                return res.send({
                    status: "failed to delete tour",
                })
            }
            if (tourUpdate.data.statusCode !== 201) {
                return res.status(200).send({
                    data: tourUpdate
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
            const tags = await tourModel.find().select('tags');
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
    
        const tours = await TourServices.search(combinedConditions);
    
        res.json(tours);
      };
      getFavorite = async (req, res) => {
        try {
          const tourFavorite = await TourServices.getFavorite(req, res)
          const size = await tourModel.find({});
          return res.status(200).json({
            data: tourFavorite,
            
            size: size.length,
            success: true,
          });
        } catch (error) {
          return res.status(500).json({ status: false, error: "Error Occurred" });
        }
      };
      getNew = async (req, res) => {
        try {
          const tourNew = await TourServices.getNew(req, res);
          const size = await tourModel.find({}).populate("owner");
          return res.status(200).json({
            data: tourNew,
            size: size.length,
            success: true,
          });
        } catch (error) {
          return res.status(500).json({ status: false, error: "Error Occurred" });
        }
      };

}

export default new TourController;