const express = require('express');
const app = express();


const jwt = require("jsonwebtoken");
const {JWT_SECRET , auth} = require("./auth/auth");

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const path = require('path');

require('dotenv').config();

const bcrypt = require('bcrypt');

const {UserModel , DataModel} = require("./models/data");
const { runInNewContext } = require('vm');

app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(express.static(path.join(__dirname,'public')));

app.get("/",(req,res)=>{
    res.render("home.ejs")
})

app.get("/registration",(req,res)=>{
    res.render("registration.ejs");
})
app.post("/registration",async (req,res)=>{

    const { email, password, hotelName } = req.body;
    try{
        const hashedPass = await bcrypt.hash(password,10);
        await UserModel.create({
            email : email,
            password : hashedPass,
            hotelName : hotelName,
        })
        res.render("done.ejs");
    }
    catch(err){
        res.status(400).send("Bad gateway");
    }

})


app.get('/login', (req,res)=>{
    res.render("login.ejs")
});


app.post('/login', async (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({ email });

    if (!user) {
        return res.status(400).send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send("Invalid password");
    }
    
    const token = jwt.sign({
        id : user._id.toString()
    },JWT_SECRET);

    res.cookie("token" , token);
    res.redirect('/profile');
})

app.get('/profile', auth, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId);
        if (!user) return res.status(404).send("User not found");

        res.render('profile.ejs', { hotelName: user.hotelName });
    } catch (err) {
        res.status(500).send("Something went wrong");
    }
});

app.listen(3000);