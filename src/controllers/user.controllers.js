import { User } from "../models/user.models";

const RegiserUser=async(req,res)=>{
    const {name,email,password}=req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
        
    }
    const user=User.findOne({email});
    if(user){
        return res.status(400).json({ message: "User already exists" });
    }else{
        const newUser=user.create({
            name,email,password
        })
        return res.status(201).json({
            message: "User registered successfully",
            user:newUser
        });
    }
}

const generateAccessToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "6h",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
};




const LoginUser=async(req,res)=>{
     const {name,email}=req.body;
    if (!name || !email ) {
        return res.status(400).json({ message: "Please fill all fields" })
    }
    const user=User.findOne({email});
    if(!user)  {
    return    res.status(400).json({message:"User not found"})}
    const isPasswordValid=await user.matchPassword(password,user.password);
    if(!isPasswordValid){
        return res.status(400).json({message:"Invalid password"})
    }
      const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // cookies
  res.cookie("refreshToken", refreshToken, { http: true, secure: false });
  return res.status(200).json({
    message:"User logged in successfully",
    accessToken:accessToken,
    refreshToken:refreshToken,
    data:user
  })
}



const LogoutUser=async(req,res)=>{
    res.clearCookie("refreshToken");
    return res.status(200).json({message:"User logged out successfully"})
}

const getUserProfile=async(req,res)=>{
    try{
        const user=req.user;
        console.log("user profile",user)
        res.json({
            message:"User profile fetched successfully",
            data:user
        })
    }catch (error) {
    console.log("error from user route", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "no refresh token found!" });

  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

  const user = await User.findOne({ email: decodedToken.email });

  if (!user) return res.status(404).json({ message: "invalid token" });

  const generateToken = generateAccessToken(user);
  res.json({ message: "access token generated", accesstoken: generateToken });

  res.json({ decodedToken });
};
export {
  RegiserUser,
  LoginUser,
  LogoutUser,
  getUserProfile,
  refreshToken
};