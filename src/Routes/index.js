import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { activation,findUser, findingUser, forgotToken, updatingPassword } from "../Controllers/index.js";
import addingUser from "../Controllers/index.js";
import { transport } from "../Mailer/nodeMailer.js";
import { generateExpiryToken, generateToken, isAuthorized } from "../Authorization/auth.js";
import addingUrl, { addingShortUrl, allUrls, find, findByUrl, findData, findUrl, increaseCount } from "../Controllers/links.js";
//initializing router
const router=express.Router();
//user registration
router.post("/register",async(req,res)=>{
    try {
        //finding if user already registered with the emailid
        const findUser=await findingUser(req.body.email);
        if(findUser.length>=1){
            return res.status(400).json({message:"User email already registered"});
        }else{
            //encrypting user password
            const salt=await bcrypt.genSalt(10);
            const hashedPassword=await bcrypt.hash(req.body.password,salt);
            //creating object with user details
            const data={
                email:req.body.email,
                firstName:req.body.firstName,
                lastName:req.body.lastName,
                password:hashedPassword,
                status:"InActive",
                token:""
            }
            //adding user to the db
            const registeringUser=await addingUser(data);
            //sending mail to activate account
            const link=`https://makeasyurl.netlify.app/activation/${registeringUser[0]._id}`
            //composing mail
            const composingMail={
                from:"fullstackpurpose@gmail.com",
                to:registeringUser[0].email,
                subject:"Account Activation Link",
                html:`<a href=${link}><button style="background:violet;
                color:black;
                height:50px;
                width:150px;
                border:none;
                border-radius:15px;
                font-weight:bolder;
                ">Click to Activate Account</button></a>
                `
            }
            //creating transport to send mail
            transport.sendMail(composingMail,(error,info)=>{
                if(error){
                    console.log(error)
                }else{
                    console.log("mail sent")
                }
            })
            return res.status(200).json({message:"Activation link sent to Mail",data:registeringUser})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Registration failed"})
    }
})
//account activation
router.get("/activation/:id",async(req,res)=>{
    try {
        //finding user and updating account status
         const activateUser=await activation(req.params.id);
         if(!activateUser){
            return res.status(400).json({message:"Invalid link or Link Expired"});
         }else{
            return res.status(200).json({message:"Activation Successfull"})
         }
        }
   catch (error) {
        console.log(error)
        res.status(500).json({message:"Account activation failed"})
    }
})
//login User
router.post("/login",async(req,res)=>{
    try {
        //checking is user email is registered 
        const checkUser=await findingUser(req.body.email);
        if(checkUser.length===0){
            return res.status(400).json({message:"Invalid email"});
        }else{ 
            //validating password with email
            const validatingPassword=await bcrypt.compare(req.body.password,checkUser[0].password);
            if(validatingPassword){
                //checking if account is active or not
                if(checkUser[0].status==="Active"){
                    //token is generated and passed as response
                    const token=generateToken(checkUser[0]._id);
                    return res.status(200).json({message:"login success",token,data:checkUser})
                }else{
                    //if account is not active
                     //sending mail to activate account
                    const link=`https://makeasyurl.netlify.app/activation/${checkUser[0]._id}`
                    //composing mail
                    const composingMail={
                        from:"fullstackpurpose@gmail.com",
                        to:checkUser[0].email,
                        subject:"Account Activation Link",
                        html:`<a href=${link}><button style="background:violet;
                        color:black;
                        height:50px;
                        width:150px;
                        border:none;
                        border-radius:15px;
                        font-weight:bolder;
                        ">Click to Activate Account</button></a>
                        `
                    }
                    //creating transport to send mail
                    transport.sendMail(composingMail,(error,info)=>{
                        if(error){
                            console.log(error)
                        }else{
                            console.log("mail sent")
                        }
                    })
                    return res.status(200).json({message:"Account is Not Active, Activation Link sent to mail"})
                }
            }else{
                return res.status(200).json({message:"Invalid Password"})
            }  
        }
}catch (error) {
        console.log(error)
        res.status(500).json({message:"Login User Failed"})
    }
})
//forgot password
router.post("/forgot",async(req,res)=>{
    try {
        //checking user email is registered or not
        const findUser=await findingUser(req.body.email);
        if(findUser.length<1){
            return res.status(400).json({message:"Invalid Email address"})
        }else{
            //creating expiry token
            const token=await generateExpiryToken(findUser[0]._id);
            //adding token to the database
            const setToken=await forgotToken(findUser[0]._id,token);
             //sending mail to reset password
             const link=`https://makeasyurl.netlify.app/reset/${findUser[0]._id}`
             //composing mail
             const composingMail={
                 from:"fullstackpurpose@gmail.com",
                 to:findUser[0].email,
                 subject:"Password Reset Link",
                 html:`<a href=${link}><button style="background:violet;
                 color:black;
                 height:50px;
                 width:150px;
                 border:none;
                 border-radius:15px;
                 font-weight:bolder;
                 ">Click to Reset Password</button></a>`
             }
             //creating transport to send mail
             transport.sendMail(composingMail,(error,info)=>{
                 if(error){
                     console.log(error)
                 }else{
                     console.log("mail sent")
                 }
             })
             return res.status(200).json({message:"Reset Link sent to mail"});
        }
        }
   catch (error) {
        console.log(error)
        res.status(500).json({message:"Error forgot Password"})
    }
})
//reset password
router.post("/reset/:id",async(req,res)=>{
    try {
          //finding user
          const getUser=await findUser(req.params.id);
          //verifying token
          const verify=jwt.verify(getUser[0].token,process.env.secret_key);
          //encrypting user password
          const salt=await bcrypt.genSalt(10);
          const hashedPassword=await bcrypt.hash(req.body.password,salt);
          //updating password
          const updating=await updatingPassword(getUser[0]._id,hashedPassword);
          return res.status(200).json({message:"Password Reset Successfull"});
        }
   catch (error) {
        console.log(error)
        res.status(500).json({message:"Reset Link Expired"})
    }
})
//adding long url 
router.post("/addUrl",isAuthorized,async(req,res)=>{
    try {
        //checking if url already exists
        const findUrl=await findByUrl(req.body.longUrl);
        if(findUrl.length>=1){
            return res.status(400).json({error:"Url Already Shortened"})
        }else{
            //creating object of data details
            const data={
                longUrl:req.body.longUrl,
                shortUrl:"",
                createdOn:new Date().toDateString(),
                count:0,
                string:""
            }
            //adding url to database
            const addingData=await addingUrl(data);
            return res.status(200).json({message:addingData})
        }
    } catch (error) {
        console.log("Error adding Url",error);
        res.status(500).json({error:"Error adding Url"})
    }
})
//adding shortUrl
router.post("/shortUrl",isAuthorized,async(req,res)=>{
    try {
        //finding url
        const findUrl=await find(req.body.id);
        //creating randomstring
        const randomString=Math.random().toString(36).slice(5,9);
        //passing randomString as params
        const link=`https://makeasyurl.netlify.app/new/${randomString}`
        //adding short url 
        const updateShortUrl=await addingShortUrl(findUrl._id,link,randomString);
        //finding url to send response
        const findUrlForData=await find(req.body.id);
        res.status(200).json({message:findUrlForData})
    } catch (error) {
        console.log(error)
        res.status(500).json({error:"Error creating short url"})
    }
})
//redirecting to long url using short url
router.get("/getUrl/:string",async(req,res)=>{
    try {
        //finding long url using string passed in params
        const findUrlByString=await findUrl(req.params.string);
        if(findUrlByString.length===0){
            res.status(200).json({error:"Invalid Url"}) 
        }else{
            //increasing shortened url count 
            const countIncrement=await increaseCount(findUrlByString[0]._id)
            res.status(200).json({message:findUrlByString[0].longUrl});
        }
        
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Error redirecting"})
    }
})

//all Url
router.get("/getUrl",isAuthorized,async(req,res)=>{
    try {
        //finding all shortened urls
        const findUrls=await allUrls();
        res.status(200).json({message:findUrls}); 
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Error getting all urls"})
    }
})

//count for dashboard
router.get("/count",async(req,res)=>{
    try {
        //getting count of number of urls created
        const data=await findData();
        res.status(200).json({message:data}); 
    } catch (error) {
        console.log(error)
        res.status(500).json({error:"Error getting count"})
    }
}) 

//exporting router
export const Router=router;
