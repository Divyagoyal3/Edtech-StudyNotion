const User = require("../models/User");
const OTP  = require("../models/OTP");
const otpGenerator = require("otp-generator");


// sendOtp
exports.sendOTP = async(req,res) =>{
   
   try{
    // fetch email from request body
    const {email} = req.body;
    // check if user already exists
    const checkUserPresent = await User.findOne({email});

    // if user already exist then return a response
    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:'User already registered',
        })
    }

    // generate otp
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false
    });
    console.log("otp generated", otp);

    // check unique otp or not

    let result = await OTP.findOne({otp:otp});

    while(result){
        otp = otpGenerator(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        result = await OTP.findOne({otp:otp});
    }

    const otpPayload = {email, otp};
    // create an entry for OTP
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // return response successful
    res.status(200).json({
        success:true,
        message:'OTP Sent Successfully',
        otp,
    })

}
catch(error){
   console.log(error);
   return res.status(500),json({
    success:false,
    message:error.message,
   })
}
}

// sign up

exports.signUp = async(req, res) =>{
    // fetch data from body
    const {firstName, lastName,
        email,password,confirmPassword,accountType,contactNumber,otp } = req.body;
    
    // validate 

    // confirm password

    // check if user already exists

    // find most recent OTP stored for the user

    // validate Otp

    // hash Password

    // entry create in db

    // return res
}


// login 


// ChangePassword
