const User = require('./User')
const GoogleStrategy = require('passport-google-oauth20').Strategy

module.exports = (passport, PORT) => {

    //  * Creating a new Strategy to sign in
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${PORT}/auth/google/callback`
    },

    // * Handling tokens and user data
        async function (accessToken, refreshToken, profile, done) {
            const newUser = {
                googleId: profile.id,
                displayName: profile.displayName,
                firstName: profile.givenName,
                lastName: profile.familyName,
                image: profile.photos[0].value
            }

            try {
                let user = await User.findOne({ googleId: profile.id })

                if (user) {
                    done(null, user)
                } else {
                    user = await User.create(newUser)
                    done(null, user)
                }
            } catch (error) {
                console.log(error)
            }
        }
    ))

    // * Below 2functions are just to maintain the user instances to and from session
    passport.serializeUser((user, done) => done(null, user.id))

    passport.deserializeUser(function (id, done) {
        User.findById(id, (err, user) => done(err, user))
    })
}