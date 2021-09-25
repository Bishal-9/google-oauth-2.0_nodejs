require('dotenv').config()

const express = require('express')
const cors = require('cors')
const passport = require('passport')
const mongoose = require('mongoose')
const session = require('express-session')

const app = express()
const PORT = process.env.PORT || 5000

// * Google Authentication Strategy
require('./GoogleAuth')(passport, PORT)

// * Connecting to MongoDB 
mongoose.connect(process.env.MONGODB_URI, () => {
    console.log(`Database connected!!`)
})

// * Middlewares
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

// * Custom Middleware
const isLoggedIn = (req, res, next) => {
    if (req.user) {
        next()
    } else {
        res.sendStatus(401)
    }
}

// * Routes
app.get('/', (req, res) => {
    res.send('<center><h1>API working!! 🚀🚀🚀</h1></center>')
})

// * Routes for Google Auth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/failed' }),
    function (req, res) {
        
        // * Successful authenticated
        res.redirect('/dashboard')
    }
)

//  * Routes if Authentication gets failed
app.get('/failed', (req, res) => {
    res.send('<center><h1>You are failed to login!! 🥺🥺🥺</h1></center>')
})

app.get('/dashboard', isLoggedIn, (req, res) => {
    res.send(`<center><h1>Welcome to your Dashboard!! Mr. ${req.user.displayName}🥳🥳🥳</h1></center>`)
})

app.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) console.log('Error', error)
    })
    req.logOut()
    res.redirect('/')
})

// * Server listen
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))
