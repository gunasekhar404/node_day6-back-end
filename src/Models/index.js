import mongoose from "mongoose";
//model schema for url collection in database
const urlSchema=new mongoose.Schema({

   longUrl:{
    type:String,
   },
   shortUrl:{
    type:String,
   },
   createdOn:{
    type:String
   },
   count:{
      type:Number
   },
   string:{
      type:String
   }

},
{timestamps:true}
);

const Link=mongoose.model("links",urlSchema);
export {Link};