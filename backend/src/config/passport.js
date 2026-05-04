const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id: googleId, displayName: name, emails, photos } = profile;
        const email = emails[0].value;
        const avatar = photos[0].value;

        let user = await User.findOne({ where: { googleId } });

        if (!user) {
          user = await User.findOne({ where: { email } });
          if (user) {
            await user.update({ googleId });
            // Update or create profile with avatar
            await UserProfile.upsert({
              user_id: user.id,
              name,
              avatar,
            });
          } else {
            user = await User.create({
              email,
              googleId,
              isVerified: true,
              role: 'customer',
            });
            // Create profile with avatar
            await UserProfile.create({
              user_id: user.id,
              name,
              avatar,
            });
          }
        }

        if (!user.isActive) {
          return done(null, false, { message: 'Tài khoản đã bị khóa' });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    },
  ),
);

// Không dùng session vì xài JWT
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
