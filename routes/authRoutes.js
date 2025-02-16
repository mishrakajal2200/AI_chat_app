import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    console.log("Request Body:", req.body); // Debugging line
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ userName, email, password: hashedPassword });
    try {
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).json({ error: "Registration error" });
    }
});

// login
router.post('/login',async (req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});

    if(user && (await bcrypt.compare(password,user.password))){
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET,{
            expiresIn :"1h",
        });
        res.json({token, userId:user._id});
    }else{
        res.status(401).json({ error: "Invalid credentials" });
    }
})

export default router;