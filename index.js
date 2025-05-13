const express = require("express");
const app = express();
const userModel = require("./models/user");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");




app.set("views", path.join(__dirname, "views"));  
app.set("view engine", "ejs");  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); 
app.use(cookieParser());

app.use(express.static("public"));


// ********** Routes **********
app.get("/", function (req, res) {
    res.render("login"); 
});

app.get("/profile", isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    res.render("profile", { user }); 
});

// ********** Register Route **********
app.post("/register", async function (req, res) {
    let user = await userModel.findOne({ email: req.body.email });

    if (user) {
        return res.status(400).send("User already registered...");
    } else {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(req.body.password, salt, async function (err, hash) {
                let newUser = await userModel.create({
                    name: req.body.name,
                    username: req.body.username,
                    email: req.body.email,
                    password: hash
                });

                let token = jwt.sign({ email: req.body.email, userid: newUser._id },  "niranjansd");
                res.cookie("token", token);
                res.redirect("/login");
            });
        });
    }
});

// ********** Login Route **********
app.post("/login", async function (req, res) {
    let user = await userModel.findOne({ email: req.body.email });

    if (!user) {
        return res.status(400).send("Invalid credentials...");
    } else {
        bcrypt.compare(req.body.password, user.password, function (err, result) {
            if (result) {
                let token = jwt.sign({ email: req.body.email, userid: user._id,username: user.username ,name:user.name,password:user.password}, "niranjansd");
                res.cookie("token", token);
                console.log("token is created:"+ user.username);
                res.redirect("/homepage");
            } else {
                res.redirect("/login");
            }
        });
  
    }
});

// ********** Logout Route **********//

    app.get("/logout", function (req, res) {
        res.clearCookie("token"); 
        res.redirect("/login");
    });
    


/**************homepage *******************/ 
app.get("/homepage", function (req, res) {
    // console.log("token is here");
    const token = req.cookies.token;
    const user = jwt.verify(token, "niranjansd");
    // console.log("token is created : "+user);


    res.render("homepage",{ user: user });
});

/***************************************////*controls */
app.get("/homepage/Controls", function (req, res) {
    
    res.render("Controls");
});

app.get("/homepage/VKIT", function (req, res) {
    
    res.render("VKIT");
});


/**************************profile *******************/ 
app.get("/profile", (req, res) => {
    console.log("token is here");
    const token = req.cookies.token;
    if (token) {
        try {
            const user = jwt.verify(token, "niranjansd");
            console.log("Decoded token:", user);
            res.render("profile", { name: user.name, username: user.username, email: user.email });
        } catch (error) {
            console.error("Token verification failed:", error.message);
            res.status(401).send("Invalid token");
        }
    } else {
        res.redirect("/login");
    }
});



// ********** Signup Route **********
app.get("/signup", function (req, res) {
    res.render("signup"); 
});

app.get("/login", function (req, res) {
    res.render("login"); 
});


function isLoggedIn(req, res, next) {
    if (!req.cookies.token) {
        return res.redirect("/login");
    } else {
        try {
            let data = jwt.verify(req.cookies.token, "niranjansd");
            req.user = data;
            next();
        } catch (error) {
            return res.redirect("/login");
        }
    }
}

// ********** Start Server **********
app.listen(3000, function () {
    console.log("Server Started on http://localhost:3000");
});
