const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const driver = require('../db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    const session = driver.session();
    try {
      // Check if user exists or create them in Neo4j
      const result = await session.run(
        `MERGE (u:User {googleId: $googleId})
         ON CREATE SET u.username = $name, u.email = $email, u.createdAt = datetime()
         RETURN u`,
        { googleId: profile.id, name: profile.displayName, email: profile.emails[0].value }
      );
      const user = result.records[0].get('u').properties;
      return done(null, user);
    } catch (err) {
      return done(err, null);
    } finally {
      await session.close();
    }
  }
));