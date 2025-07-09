//here we store all the callback function related to authatication
import cloudinary from "../lib/cloudinary.js";
import {  genrateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"

export const signup = async (req, res) => {
  try {
    const { password, email, username } = req.body;

    if (!password || !email || !username) {
      return res.status(400).json({ message: "all fields must be filled" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "password must be at least 6 character" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "email already exists" });

    //here we use bcrypt package to save user password in ecrypted format
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: username,
      email: email,
      password: hashPassword,
    });

    if (newUser) {
      //here we generate the jwt token using genrate function
      genrateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        __id: newUser._id,
        fullname: newUser.name,
        email: newUser.email,
        password:newUser.password,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "invalid user data" });
    }
  } catch (error) {
    console.log("error in the signup controller",error.message)
    res.status(500).json({ message: "Internal servar error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    genrateToken(user._id,res);

    res.status(200).json({
        __id: user._id,
        fullname: user.username,
        email: user.email,
        profilePic: user.profilePic,
      }
    )

  } catch (error) {
    console.log("error in the login controller ", error.message);
    res.status(400).json({ message: "internal servar error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt","",{maxAge:0});
    res.status(200).json({message:"Logged out successfully"});
  } catch (error) {
    console.log("error in the logout controller")
    res.status(400).json({message:"internal serval error"})
  }
};

export const updateProfile = async(req,res)=>{
    try {
        const {profilePic}=req.body;
        const userId=req.user._id;

        if(!profilePic){
            return res.status(400).json({message:"profile pic is required"});
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic);
        const updatedUser =await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("the error occur in the update profile controller");
        res.status(500).json({message:"Internal server error"});
    }
};


export const checkAuth =(req,res)=>{
    try {
         res.status(200).json(req.user);
    } catch (error) {
         console.log("the error occur in the update check controller");
        res.status(500).json({message:"Unauthorized, no token provided"});
    }
}