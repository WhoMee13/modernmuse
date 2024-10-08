const express = require('express');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');
const router = express.Router();
const eah = require("express-async-handler");
const Website = require("../models/Website");
const User = require('../models/User');
// Set storage engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './client/public/images');
  },
  filename: (req, file, cb) => {
    // Generate a sanitized filename with no spaces
    const sanitizedFilename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, sanitizedFilename);
  }
});

// Multer configuration for handling file uploads
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|jfif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
  }
});

// Add a product (with image)
router.post('/add',eah( upload.single('image')), eah(async (req, res) => {
  try {
    const { productName, description, price } = req.body;


    // Get the file path of the uploaded image
    const imageUrl = req.file ? `/images/${req.file.filename}` : '';
    const websiteURL = req.body.websiteURL || ""
    const websiteName = req.body.websiteName|| ""
    let websiteId="";
    console.log(typeof websiteName,websiteURL)

    if(websiteName &&  websiteURL){
      const website = await Website.findOne({websiteName,websiteURL})
      if(website){
        websiteId = website._id

      }else{
        throw new Error("No such website found")
      }
      

    }
    // Create new product
    const product = websiteId?await Product.create({
      productName,
      description,
      price,
      imageUrl,
      websiteId,
      sizeType:req.body.sizeType || null,
      size:req.body.size || null,
    })
    :
    await Product.create({
      productName,
      description,
      price,
      imageUrl,
      sizeType:req.body.sizeType || null,
      size:req.body.size || null,
    })
    websiteId && await Website.findByIdAndUpdate(websiteId,{$push:{products:product._id}})

    res.status(201).json({ success: true, message: 'Product added successfully', product });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}));

// Get all products (with image)
router.get('/', eah(async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
}));
router.delete("/:id",eah(async(req,res)=>{
  await Product.findByIdAndDelete(req.params.id)
  res.json({success:true,message:"Product deleted successfully"})
}))
router.get("/search/:searchTerm",eah(async(req,res)=>{
  const searchTerm = req.params.searchTerm
  const products = await Product.find({productName:{$regex:`^${searchTerm}`,$options:"i"}}).sort({createdAt:-1})
  const sortedProducts = []
  products.forEach(ele=>{
    if(ele.productName.toLowerCase()===searchTerm.toLowerCase()){
      sortedProducts.unshift(ele)
    }
    else{
      sortedProducts.push(ele)
    }
  })
  res.json({success:true,data:sortedProducts})
}))
router.get("/for-you",eah(async(req,res)=>{
  const user = await User.findById(req.user.id)
  const data = {}
  if(user.hip){

    const forHip =  await Product.find({sizeType:"hip",size:user.hip}).sort({createdAt:-1}).limit(10)
    data["hip"]=forHip
  }
  else{
    data["hip"] = []
  }
  if(user.shoulder){

    const forShoulder = await Product.find({sizeType:"shoulder",size:user.shoulder}).sort({createdAt:-1}).limit(10)
    data["shoulder"] = forShoulder
  }
  else{
    data["shoulder"] = []
  }
  res.json({success:true,data:data})
}))
router.get("/:id",eah(async(req,res)=>{
  const product = await Product.findById(req.params.id).populate("websiteId")
  res.json({success:true,data:product})
}))
router.put("/:id/update-price",eah(async(req,res)=>{
  const {newPrice} = req.body
  const product = await Product.findByIdAndUpdate(req.params.id,{price:newPrice})
  res.json({success:true,message:"Price updated successfully"})
}))
module.exports = router;
