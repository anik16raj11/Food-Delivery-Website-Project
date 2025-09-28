import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js"
import { sendOtpMail } from "../utils/mail.js";
import crypto from "crypto";


export const signUp=async (req, res) => {
    try {
        const {fullName, email, password, mobile, role} = req.body
        let user=await User.findOne({email})
        if(user){
            return res.status(400).json({message:"User already exist."})
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be atleast 6 characters."})
        }
        if(mobile.length<10){
            return res.status(400).json({message:"Invalid mobile number."})
        }

        const hashedPassword=await bcrypt.hash(password,10)
        user=await User.create({
            fullName,
            email,
            role,
            mobile,
            password:hashedPassword
        })

        const token=await genToken(user._id)
        res.cookie("token", token,{
            secure:true,
            sameSite:"none",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })

        return res.status(201).json(user)

    } catch (error) {
        return res.status(500).json(`sign up error ${error}`)
    }
}

export const signIn=async (req, res) => {
    try {
        const {email, password} = req.body;

        

        const user=await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User does not exist."})
        }

        const isMatch=await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({message:"Incorrect Password!!"})
        }


        const token=await genToken(user._id)
        res.cookie("token", token,{
            secure:true,
            sameSite:"none",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })

        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json(`Sign In error ${error}`)
    }
}

export const signOut=async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({meaasge:"Sign Out Successfullly"})
    } catch (error) {
        return res.status(500).json(`Sign Out error ${error}`)
    }
} 

export const sendOtp=async (req, res) =>{
    try {
        const {email}=req.body
        const user=await User.findOne({email})
        if(!user) {
            return res.status(400).json({message:"User does not exist."})
        }
        const otp=Math.floor(1000 + Math.random() * 9000). toString()
        user.resetOtp=otp
        user.otpExpires=Date.now()+5*60*1000
        user.isOtpVerified=false
        await user.save()
        await sendOtpMail(email,otp)
        return res.status(200).json({meaasge: "OTP sent sucessfully"})
    } catch (error) {
        return res.status(500).json(`Osend otp error ${error}`)
    }
}

export const verifyOtp=async (req,res) => {
    try {
        const {email, otp}=req.body
        const user=await User.findOne({email})
        if(!user || user.resetOtp!=otp || user.otpExpires<Date.now()){
            return res.status(400).json({meaasge:"invalid/expired otp"})
        }
        user.isOtpVerified=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()   
        return res.status(200).json({meaasge:"otp verifiy Successfullly"})
            
    } catch (error) {
        return res.status(500).json(`verify Out error ${error}`)
    }
}

export const resetPassword=async (req,res) => {
    try {
        const {email,newPassword}=req.body
        const user=await User.findOne({email})
        if(!user || !user.isOtpVerified) {
            return res.status(400).json({message:"otp verification required"})
        }
        const hashedPassword=await bcrypt.hash(newPassword,10)
        user.password=hashedPassword
        user.isOtpVerified=false
        await user.save()
        return res.status(200).json({message:"password reset sucessfully"})

    } catch (error) {
        return res.status(500).json(`reset password error ${error}`)
    }
}

export const googleAuth=async(req,res) => {
    try {
        const {fullName, email, mobile, role}=req.body
        let user=await User.findOne({email})
        if(!user){
            const randomPassword = crypto.randomBytes(16).toString("hex");
            user=await User.create({
                fullName,
                email,
                mobile,
                role,
                isGoogleUser: true,
                password: randomPassword
            })
        }
        const token=await genToken(user._id)
        res.cookie("token", token,{
            secure:true,
            sameSite:"none",
            maxAge:7*24*60*60*1000,
            httpOnly:true
        })

        return res.status(200).json({message: "Google auth success",user,});
    } catch (error) {
        console.error(" Google Auth Error:", error);
        return res.status(500).json({message: "Google Auth error",error: error.message, stack: error.stack,});
    }
}
