// server/src/routes/signup.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../db.js';

const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';

const router = express.Router();

// ---------- rate limit & security ----------
const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 6,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many requests, please try again later',
      alert: 'error',
      email: '',
    });
  },
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many login attempts, please try again later',
      alert: 'error',
    });
  },
});

router.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; frame-ancestors 'none'"
  );
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=15768000; includeSubDomains; preload'
  );
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// ---------- helpers ----------
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (m) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m])
  );
}

// ---------- POST /api/signup/register ----------
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, name, username, password, repeatPassword } = req.body;
    const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

    // basic validation
    if (typeof email !== 'string' || email.trim() === '') {
      return res.json({ message: 'Email is required', email: '', alert: 'error' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.json({
        message: 'Please enter a valid email address',
        email: '',
        alert: 'error',
      });
    }
    if (email !== escapeHtml(email)) {
      return res.json({
        message: 'Invalid email format',
        email: '',
        alert: 'error',
      });
    }

    if (typeof name !== 'string' || name.trim() === '') {
      return res.json({ message: 'Name is required', email: '', alert: 'error' });
    }
    if (typeof username !== 'string' || username.trim() === '') {
      return res.json({
        message: 'Username is required',
        email: '',
        alert: 'error',
      });
    }
    if (typeof password !== 'string' || password.trim() === '') {
      return res.json({
        message: 'Password is required',
        email: '',
        alert: 'error',
      });
    }
    if (typeof repeatPassword !== 'string' || repeatPassword.trim() === '') {
      return res.json({
        message: 'Repeating the password is required',
        email: '',
        alert: 'error',
      });
    }
    if (password !== repeatPassword) {
      return res.json({
        message: 'Passwords do not match',
        email: '',
        alert: 'error',
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data: existing, error: checkError } = await supabase
      .from('USER')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check error:', checkError);
      return res.status(500).json({ message: 'Database error', alert: 'error' });
    }

    if (existing) {
      return res.json({
        message: 'The account already exists.',
        email: '',
        alert: 'error',
      });
    }

    const { data: newUser, error: insertError } = await supabase
      .from('USER')
      .insert([{
        name,
        username,
        email,
        password: passwordHash,
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ message: 'Failed to create account', alert: 'error' });
    }

    console.log('New user inserted with id:', newUser.id);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Account created successfully',
      email,
      alert: '',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email
      },
    });
  } catch (err) {
    console.error('SIGNUP /register ERROR:', err);
    return res
      .status(500)
      .json({ message: 'Internal server error', alert: 'error' });
  }
});

// ---------- POST /api/signup/login ----------
router.post('/login', loginLimiter, async (req, res) => {
  try {
    console.log('--- LOGIN DEBUG START ---');
    console.log('req.body:', req.body);

    // match your frontend body keys
    const emailOrUsername =
      req.body.emailOrUsername ?? req.body.email ?? req.body.username;
    const pass = req.body.pass ?? req.body.password;

    console.log('emailOrUsername (derived):', emailOrUsername);
    console.log('pass (derived):', pass ? '(provided)' : '(missing)');

    if (!emailOrUsername || !pass) {
      console.log('Missing emailOrUsername or pass -> 400');
      console.log('--- LOGIN DEBUG END (missing fields) ---');
      return res.status(400).json({
        message: 'Email/username and password are required',
        alert: 'error',
      });
    }

    console.log('Running SELECT on USER table with:', emailOrUsername);
    const { data: user, error } = await supabase
      .from('USER')
      .select('id, name, username, email, password')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .maybeSingle();

    console.log('Query result user:', user);

    if (error || !user) {
      console.log('No user found for this email/username -> 401');
      console.log('--- LOGIN DEBUG END (no user) ---');
      return res.status(401).json({
        message: 'Invalid email/username or password',
        alert: 'error',
      });
    }
    console.log('User row:', user);
    console.log('DB password value:', user.password);

    const isValid = await bcrypt.compare(pass, user.password);
    console.log('bcrypt.compare result:', isValid);

    if (!isValid) {
      console.log('Password mismatch -> 401');
      console.log('--- LOGIN DEBUG END (bad password) ---');
      return res.status(401).json({
        message: 'Invalid email/username or password',
        alert: 'error',
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    console.log('Login successful for user id:', user.id);
    console.log('--- LOGIN DEBUG END (success) ---');

    return res.json({
      message: 'Login successful',
      alert: '',
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error('LOGIN /login ERROR:', err);
    console.log('--- LOGIN DEBUG END (exception) ---');
    return res
      .status(500)
      .json({ message: 'Internal server error', alert: 'error' });
  }
});

// ---------- GET /me to get current user from JWT token ----------
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.split(' ')[1];

    if (!bearerToken) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    let userId;
    try {
      const decoded = jwt.verify(bearerToken, jwtSecret);
      userId = decoded.userId;
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { data: currentUser, error } = await supabase
      .from('USER')
      .select('id, name, username, email')
      .eq('id', userId)
      .maybeSingle();

    if (error || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(currentUser);
  } catch (err) {
    console.error('GET /me error:', err);
    return res
      .status(500)
      .json({ message: 'Internal server error', alert: 'error' });
  }
});

// ---------- DELETE /api/signup/account ----------
router.delete('/account', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.split(' ')[1];

    if (!bearerToken) {
      return res.status(401).json({ message: 'Not authenticated', alert: 'error' });
    }

    let userId;
    try {
      const decoded = jwt.verify(bearerToken, jwtSecret);
      userId = decoded.userId;
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token', alert: 'error' });
    }

    const { error: deleteError } = await supabase
      .from('USER')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return res.status(500).json({ message: 'Failed to delete account', alert: 'error' });
    }

    return res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('DELETE /account error:', err);
    return res
      .status(500)
      .json({ message: 'Failed to delete account', alert: 'error' });
  }
});

// ---------- POST /logout ----------
router.post('/logout', (req, res) => {
  // With JWT, logout is handled client-side by removing the token
  return res.json({ message: 'Logged out successfully' });
});

export default router;
