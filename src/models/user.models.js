import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    image: {
      type: String,
       // if you're storing profile image URLs
    },
    isAdmin:{
        type:Boolean,
        default:false,
    }
},{
    timestamps:true,
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
 
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


export const User=mongoose.model('User',userSchema);