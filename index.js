// models used in this final project
const express = require("express");
const session = require('express-session');
const multer = require('multer');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const path = require('path');
const mongoose = require("mongoose");
const nodemailer = require('nodemailer');
const PortfolioItem = require("./models/portfolioItem");

const app = express();

// nodemailer part to send mail for registration
let transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 587,
    secure: false,
    auth: {
        user: 'saselmandel@yandex.ru',
        pass: 'swocsfxdbxfhpfnq'
    }
});

// construction of our mail
let mailOptions = {
    from: '"Sasel Mandel" <saselmandel@yandex.ru>',
    to: 'uakaboss@yandex.ru',
    subject: 'Thanks for registration',
    text: 'Hello, friend, how are you? I am sending this message from my site, thanks for registration!',
};

// access to json, public, views folder
app.use(bodyParser.json())
app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({
    extended: true
}))

// express-session to save user in session (admin_panel)
app.use(session({
    secret: 'session-key',
    resave: false,
    saveUninitialized: true
}));

// connection to mongoose db
mongoose.connect('mongodb://localhost:27017/WEB-assignment', {});

var db = mongoose.connection;

db.on('error', () => console.log("Error in Connecting to Database"));
db.once('open', () => console.log("=====================\nConnected to Database\n====================="))

// sign up route
app.post("/sign_up", async (req, res) => {
    const currentDate = new Date();
    var username = req.body.username;
    var fname = req.body.fname;
    var lname = req.body.lname;
    var age = req.body.age;
    var gender = req.body.gender;
    var country = req.body.country;
    var password = req.body.password;
    var role = 'REGULAR USER';
    // encrypting password
    const hashedPassword = await bcrypt.hash(password, 10);
    var data = {
        "creation date": currentDate,
        "username": username,
        "first name": fname,
        "last name": lname,
        "age": age,
        "gender": gender,
        "country": country,
        "password": hashedPassword,
        "role": role,
    }
    // check for my name
    if (username == 'Ualikhan') data.role = 'ADMIN';

    // finding through database by username
    const user = await db.collection('users').findOne({ username: username });
    if (user) return res.redirect('signup_failure.html')

    // adding data to database
    db.collection('users').insertOne(data, (err, collection) => {
        if (err) {
            throw err;
        }
        const sessionUser = {
            "username": username,
            "role": role,
        };
        req.session.user = sessionUser;

        // send mail to registred user
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return console.log(error);
            console.log('Mail sent to user%s', info.messageId);
        });

        console.log("User registred");
    });

    return res.redirect('signup_success.html')

})

// login route
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        // connect with collection in mongo db
        const user = await db.collection('users').findOne({ username: username });
        if (user) {
            // Compare the provided password with the hashed password in the database
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                const sessionUser = {
                    username: username,
                    role: user.role,
                };
                // if password matched
                req.session.user = sessionUser;
                console.log("Login successful");
                return res.redirect('main_page.html');
                // if not
            } else {
                console.log("Wrong password");
                return res.redirect('login_failure.html');
            }
        } else {
            console.log("User not found");
            return res.redirect('login_failure.html');
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// check for admin
const isAdmin = (req, res, next) => {
    if (req.session.user.role == 'ADMIN') {
        next();
    } else {
        res.status(403).send('You need to be an admin to access this page.');
    }
}

// multer to save file from admin page
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: async function (req, file, cb) {
        try {
            // adding data to saved data
            cb(null, parseInt(Date.now() / 10000) + path.extname(file.originalname));
        } catch (error) {
            console.error("Error getting latest item ID:", error);
            cb(error);
        }
    }
});

const public = multer({ storage: storage });

// portfolio/add route, need to be an admin to acces (isAdmin)
app.post('/portfolio/add', isAdmin, public.single('images'), async (req, res) => {
    try {
        // Create a new portfolio item in the database
        const PortfolioItem = require('./models/portfolioItem');
        console.log('image uploaded!');
        const newItem = new PortfolioItem({
            images: parseInt(Date.now() / 10000) + path.extname(req.file.originalname),
            name: req.body.name,
            description: req.body.description,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await newItem.save();

        res.redirect('/admin_panel');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// portfolio route
app.get('/portfolio', async (req, res) => {
    try {
        // Fetch portfolio items from the database
        const PortfolioItem = require('./models/portfolioItem');
        const portfolioItems = await PortfolioItem.find();
        res.json(portfolioItems);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// portfolio:/id route (UPDATE route)
app.put('/portfolio/:id', isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description } = req.body;
        const updatedItem = await PortfolioItem.findByIdAndUpdate(id, { name, description, updatedAt: new Date() }, { new: true });
        if (!updatedItem) {
            return res.status(404).send('Portfolio item not found');
        }
        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// route to show portfolio item on main page
app.put('/portfolio/mainshow/:id', isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const updatedItem = await PortfolioItem.findByIdAndUpdate(id, { mainShow: true, updatedAt: new Date() }, { new: true });
        if (!updatedItem) {
            return res.status(404).send('Portfolio item not found');
        }
        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// route to hide portfolio item from main page
app.put('/portfolio/mainclose/:id', isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const updatedItem = await PortfolioItem.findByIdAndUpdate(id, { mainShow: false, updatedAt: new Date() }, { new: true });
        if (!updatedItem) {
            return res.status(404).send('Portfolio item not found');
        }
        res.json(updatedItem);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// route to delete a portfolio item
app.delete('/portfolio/:id', isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const deletedItem = await PortfolioItem.findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).send('Portfolio item not found');
        }
        res.json({ message: 'Portfolio item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// admin panel access
app.get('/admin_panel', isAdmin, (req, res) => {
    return res.sendFile('admin_panel.html', { root: path.join(__dirname, 'public') });
});

// main route
app.get('/', async (req, res) => {
    try {
        const PortfolioItem = require('./models/portfolioItem'); // Import PortfolioItem here
        const portfolioItems = await PortfolioItem.find().sort({ createdAt: -1 });
        res.render('main_page', { portfolioItems });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// connect to db
app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('main_page.html');
}).listen(3000);