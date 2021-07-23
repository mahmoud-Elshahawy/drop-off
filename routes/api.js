var express= require("express");
var router= express.Router();
var Garage=require("../models/garage");
var Trip=require("../models/trip");
var Car=require("../models/cars");
var dropGarage=null;

router.get("/get-drop-garage",async function(req,res){
    var latitude=req.query.lat;
    var longitude=req.query.long;
    var loc=[latitude,longitude];
    try{
    const rez = await Garage.findOne({
        state:"Available",
        location: {
         $nearSphere: { $geometry:{
             type : "Point",
             coordinates : loc
         }}
        }
      })
    dropGarage=rez._id;
    res.status(200).send(rez._id);
    }
    catch(error){
        res.status(400).send(error);
    }
})
router.put("/end-trip",async function(req,res){
    var trip_id=req.body.trip;
    var rate=req.body.rate;
    var end=Date();
    var end_date=Date.now();
    try{
        let trip= await Trip.findById(trip_id);
        var starting=trip.BookingTimeml;
        var total=(end_date/3600000)-(starting/3600000);
        console.log(end_date)
        if(total<1)
        total=trip.BaseFare;
        else
        total=trip.BaseFare*total;
        console.log(total)
        trip.EndGarageID=dropGarage;
        trip.DropOffTime=end;
        trip.DropOffTimeml=end_date;
        trip.TotalFees=total;
        trip.Rate=rate;
        await trip.save();
        let car=await Car.findById(trip.CarID);
        car.state="Available";
        car.garageID=dropGarage;
        await car.save();
        const saved=await trip.save();
        res.status(200).send("Trip Ended Successfully");
    }
    catch(error){
        res.status(400).send(error);
    }
})
module.exports=router;