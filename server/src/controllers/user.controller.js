const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateAverageEmbedding } = require('../services/embedding.service');

/**
 * GET /api/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-password -skills_embedding')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users (Register)
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, skills, bio, location } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate skills embedding
    let skills_embedding = [];
    if (skills && skills.length > 0) {
      skills_embedding = await generateAverageEmbedding(skills);
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      skills: skills || [],
      skills_embedding,
      bio: bio || '',
      location: location || { type: 'Point', coordinates: [0, 0] },
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -skills_embedding')
      .populate('project_history');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { name, skills, bio, availability, location } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (availability !== undefined) updateData.availability = availability;
    if (location) updateData.location = location;

    if (skills) {
      updateData.skills = skills;
      updateData.skills_embedding = await generateAverageEmbedding(skills);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password -skills_embedding');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, getUserById, updateUser };
