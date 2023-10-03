const {Router} = require ('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const adminRouter = Router();

adminRouter.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email, is_admin: "true" });
        if (!user) {
            return res.status(400).send({
                message: "User not found"
            })
        }

        if (!(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(400).send({
                message: "Password is Incorrect"
            })
        }

        const token = jwt.sign({ _id: user._id }, "secret");

        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        res.send({
            message: "success"
        })
    } catch (error) {
        console.log(error.message);
    }
})

adminRouter.post('/logout',async(req,res)=>{
    res.cookie("jwt","",{maxAge:0});
    res.send({
        message:"Success"
    })
})

adminRouter.get('/active',async(req,res)=>{
   try{
       const cookie = req.cookies["jwt"];
       const claims = jwt.verify(cookie, "secret");
       if (!claims) {
           return res.status(401).send({
               message: "unauthenticated"
           })
       }

       const user = await User.findOne({ _id: claims._id, is_admin: "true" })
       const { password, ...data } = user.toJSON();
       res.send(data);
   } catch (error) {
        return res.status(401).send({
            message :"unauthenticated"
        })
   }
})

adminRouter.get('/users',async(req,res)=>{
    try {
        const user = await User.find({});
        res.send(user)
    } catch (error) {
        console.log(error.message);
    }
})

adminRouter.post('/deleteUser/:id',async(req,res)=>{
    try {
        const deleteUser = await User.deleteOne({_id:req.params.id});
        if(!deleteUser){
            return res.send({
                message:"Deltion went wrong"
            })
        }
        res.send(deleteUser);
    } catch (error) {
        console.log(error.message);
    }
})

adminRouter.post('/editDetails/:id',async(req,res)=>{
    try {
        
        const userData = await User.findOne({_id:req.params.id});
        if(!userData){
            return res.send({
                message:"Something went wrong"
            })
        }
        const{password,...data} = userData.toJSON();
        res.send(data)

    } catch (error) {
        console.log(error.message);
    }
})

adminRouter.post('/editUser',async(req,res)=>{
    try {
        const {name,email} = req.body;
        const userUpdate = await User.updateOne({ email:email},{ $set:{ name:name } });
        if(!userUpdate){
            return res.status(400).send({
                message:"Something went wrong"
            })
        }
        return res.send({
            message:"success"
        })
    } catch (error) {
        console.log(error.message);
    }
})

adminRouter.post('/createUser',async(req,res)=>{
    try {
        const {name, email, password} = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);
        const record = await User.findOne({email:email});

        if(record){
            return res.status(401).send({
                message:"Email is already registered"
            })
        } else {
            const user = new User({
                name,
                email,
                password:hashPassword
            });
            const result = await user.save();

            res.status(200).send({
                message:"success"
            })
        }
    } catch (error) {
        console.log(error.message);
    }
})

module.exports = adminRouter