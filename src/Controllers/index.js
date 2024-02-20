import { ObjectId } from "mongodb";
import { User } from "../Models/user.js";

//registration
export default function addingUser(data){
    return User.insertMany(data);
}
//finding user using email
export function findingUser(email){
    return User.find({email});
}
//activating user
export function activation(id){
    return User.findByIdAndUpdate({_id:new ObjectId(id)},{$set:{status:"Active"}});
}
//add token to db for forgot password
export function forgotToken(id,token){
    return User.findByIdAndUpdate({_id:new ObjectId(id)},{$set:{token}})
}
//finding user using email
export function findUser(id){
    return User.find({_id:new ObjectId(id)});
}
//empty token value after resetting password
export function updatingPassword(id,password){
    return User.findByIdAndUpdate({_id:new ObjectId(id)},{$set:{password,token:""}});
}