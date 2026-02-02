import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import { hashPassword } from '../utils/auth.js';

// Load environment variables before checking them
dotenv.config();

console.log('🔐 Configuring OAuth strategies...');
console.log('   Google Client ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Not set');
console.log('   GitHub Client ID:', process.env.GITHUB_CLIENT_ID ? '✓ Set' : '✗ Not set');

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('   ✓ Registering Google OAuth strategy');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google OAuth callback for:', profile.emails?.[0]?.value);
          
          // Check if user exists by email
          let user = User.findByEmail(profile.emails[0].value);

          if (!user) {
            // Create new user from Google profile
            const username = profile.emails[0].value.split('@')[0] + '_' + Math.random().toString(36).substring(7);
            const hashedPwd = await hashPassword('oauth_' + Math.random().toString(36));
            user = User.create({
              username,
              email: profile.emails[0].value,
              password: hashedPwd,
              avatar: profile.photos?.[0]?.value || '/avatars/default.png',
              bio: 'Signed up with Google'
            });
            console.log('Created new user from Google:', username);
          } else {
            console.log('Existing user found:', user.username);
          }

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('   ✗ Google OAuth not configured (missing credentials)');
}

// Configure GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('   ✓ Registering GitHub OAuth strategy');
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('GitHub OAuth callback for:', profile.username);
          
          // GitHub might not provide email in profile
          const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;

          // Check if user exists by email or username
          let user = User.findByEmail(email);

          if (!user && profile.username) {
            user = User.findByUsername(profile.username);
          }

          if (!user) {
            // Create new user from GitHub profile
            const username = profile.username || `github_${Math.random().toString(36).substring(7)}`;
            const hashedPwd = await hashPassword('oauth_' + Math.random().toString(36));
            user = User.create({
              username,
              email,
              password: hashedPwd,
              avatar: profile.photos?.[0]?.value || `https://github.com/${profile.username}.png`,
              bio: profile.bio || 'Signed up with GitHub'
            });
            console.log('Created new user from GitHub:', username);
          } else {
            console.log('Existing user found:', user.username);
          }

          return done(null, user);
        } catch (error) {
          console.error('GitHub OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log('   ✗ GitHub OAuth not configured (missing credentials)');
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = User.findById(id);
  done(null, user);
});

export default passport;
