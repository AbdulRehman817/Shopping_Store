import { Product } from "../models/product.models";

const  createProduct =async(req,res)=>{
    try {
        const {name,description,price,category,stock}=req.body
        if(!name || !description ||!price||!category||!stock){
        return    res.status(400).json({
                message:"all field must be filled properly"})
        }
        const existingProduct= await Product.findOne({ name });
        if(existingProduct){
            return  res.status(409).json({
                message:"This product is already exist",existingProduct})
            }
            else{
            const product=await Product.create({
                name,description,price,category,stock
            })
     res.status(201).json({
                message:"Product created",
            product})
        }
    } catch (error) {
       return res.status(500).json({ message: "Something went wrong", error });

    }
    
    
}

const findAllProduct=async(req,res)=>{
   try {
     const products=await Product.find()
     return res.status(200).json({
         message:"All product fetched successfully",
         products
     })
   } catch (error) {
return res.status(500).json({ message: "Something went wrong", error });

   }
}

const getSingleProduct=async(req,res)=>{
   try {
     const singleProduct=await Product.findById(req.params.id)
     if(!singleProduct){
         return res.status(404).json({ message:"product not find" })
     }
     return res.status(200).json({message:"singleProduct retrived successfully",singleProduct})
   } catch (error) {
  return res.status(500).json({ message: "Something went wrong", error });

    
   }
}
export {getSingleProduct,findAllProduct,createProduct}