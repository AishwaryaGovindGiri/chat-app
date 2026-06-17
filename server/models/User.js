import mongoose from "mongoose";

//setting the strutucure / rule of student registration form 
//we are telling database , this must be the form stucutre 
const userSchema = new mongoose.Schema({
    email : {type : String , required : true , unique : true} ,
    fullName : {type : String , required : true } ,
    password : {type : String , required : true  , minlength : 6},
    profilePic : {type : String , default : ""}, // this store url of pic 
    bio : {type : String}
} , {timestamps : true})

// ({} , {}) 2 objects createdd 

//create user model
// Schema = admission form design
// Model = actual admission office using that form
const User = mongoose.model('User' , userSchema);


export default User;

