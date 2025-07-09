import jwt from 'jsonwebtoken'

export const genrateToken =(userId,res)=>{
    //here we create the token using jwt 
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d"
    })


    //passing that token to via a cokkie to user and it will expire in 7 days

    res.cookie("jwt",token,{
        maxAge:7*24*60*60*1000,
        httpOnly:true,  //prevent xss attacks cross-site scripting attacks
        sameSite:"strict", //CSRF attacks cross-site request forgery attacks
        secure:process.env.NODE_ENV !== "development"
    })

    return token;
}