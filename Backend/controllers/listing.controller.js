import uploadOnCloudinary from "../config/cloudinary.js";
import Listing from "../model/listing.model.js";
import User from "../model/user.model.js";



export const addListing = async (req,res)=>{
    try{
        let host = req.userId;
        let {title,decription,rent,city,landMark,category} = req.body
        let image1 = await uploadOnCloudinary(res.files.image1[0].path)
        let image2 = await uploadOnCloudinary(res.files.image1[0].path)
        let image3 = await uploadOnCloudinary(res.files.image1[0].path)


        let listing = await Listing.findByIdAndUpdate(id,{
            title,
            decription,
            rent,
            city,
            landMark,
            category,
            image1,
            image2,
            image3,
            host
        },{new:true})
        let user = await User.findByIdAndUpdate(host, {$puch:{listing:listing._id}},
        {new:true})

        if(!user){
            return res.status(404).json({message:"user not found "})
        }
            res.status(201).json(listing)

    } catch (error){
            return res.status(500).json({message:`AddListing error ${error}`})
    }
}

export const getlisting= async (req,res) => {
     try {
        let listing = await Listing.find().sort({createdAt:-1})
        res.status(200).json(listing)
     } catch (error) {
        res.status(500).json({message:`getListing error ${error}` })
     }
}
export const updateListing = async (rqeq,res) => {
     try {
        let {id} = req.userId;
        let listing = await Listing.find().sort({createdAt:-1})
        res.status(200).json(listing)
     } catch (error) {
        res.status(500).json({message:`getListing error ${error}` })
     }
}