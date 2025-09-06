import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Email and password validation helpers
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ msg: 'All fields required' });
  if (!emailRegex.test(email)) return res.status(400).json({ msg: 'Invalid email format' });
  if (!passwordRegex.test(password)) return res.status(400).json({ msg: 'Password must be 6+ chars, include upper, lower, and number' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ msg: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash });
  await user.save();
  res.status(201).json({ msg: 'Registered successfully' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!emailRegex.test(email)) return res.status(400).json({ msg: 'Invalid email format' });
  if (!password) return res.status(400).json({ msg: 'Password required' });
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
  res.json({ msg: 'Login successful', user: { name: user.name, email: user.email } });
});

// Protected user info
router.get('/me', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch {
    res.status(401).json({ msg: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ msg: 'Logged out' });
});

export default router;
