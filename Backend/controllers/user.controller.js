import User from "../model/user.model.js"

export const  getCurrentUser = async (requestAnimationFrame,res)=>{
    try{
        let user = await User.findById(req.userId).select("-password")
        if(!user){
            res.status(400).json({message:"user dosen't found"})
        }
         res.status(200).json(user)
    } catch (eror){
       res.status(500).json({message:`getCurrentUser error ${error}`})

    }
}

