const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username dan password diperlukan'
      });
    }
    
    // Find user by username
    const user = await User.findOne({
      where: { username },
      include: [{
        model: Role,
        attributes: ['name', 'permissions']
      }]
    });
    
    // Check if user exists
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Username atau password salah'
      });
    }
    
    // Check if password is correct
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Username atau password salah'
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        status: 'error',
        message: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.'
      });
    }
    
    // Update last login time
    await user.update({ last_login: new Date() });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );
    
    // Return user info and token
    return res.status(200).json({
      status: 'success',
      message: 'Login berhasil',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role.name,
        permissions: user.role.permissions,
        token
      }
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, role_id } = req.body;
    
    // Validate input
    if (!username || !email || !password || !full_name || !role_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Semua kolom harus diisi'
      });
    }
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [{ username }, { email }]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username atau email sudah digunakan'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      username,
      email,
      password,
      full_name,
      role_id,
      is_active: true
    });
    
    // Get user with role
    const user = await User.findByPk(newUser.id, {
      include: [{
        model: Role,
        attributes: ['name', 'permissions']
      }],
      attributes: { exclude: ['password'] }
    });
    
    return res.status(201).json({
      status: 'success',
      message: 'Registrasi berhasil',
      data: user
    });
    
  } catch (error) {
    console.error(error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        status: 'error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        attributes: ['name', 'permissions']
      }],
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Pengguna tidak ditemukan'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: user
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Password saat ini dan password baru diperlukan'
      });
    }
    
    // Find user
    const user = await User.findByPk(userId);
    
    // Check if current password is correct
    const isPasswordValid = await user.checkPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Password saat ini tidak valid'
      });
    }
    
    // Update password
    await user.update({ password: newPassword });
    
    return res.status(200).json({
      status: 'success',
      message: 'Password berhasil diperbarui'
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  // JWT is stateless, so we don't need to do anything server-side
  // The client should remove the token from storage
  
  return res.status(200).json({
    status: 'success',
    message: 'Logout berhasil'
  });
};