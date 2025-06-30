const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Autentikasi diperlukan! Token tidak ditemukan.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user with the decoded id
      const user = await User.findByPk(decoded.id, {
        include: [{
          model: Role,
          attributes: ['name', 'permissions']
        }],
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(401).json({ 
          status: 'error',
          message: 'Pengguna tidak ditemukan!' 
        });
      }
      
      if (!user.is_active) {
        return res.status(403).json({ 
          status: 'error',
          message: 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.' 
        });
      }
      
      // Add user info to request object
      req.user = user.toJSON();
      next();
      
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          status: 'error',
          message: 'Token kedaluwarsa! Silakan login kembali.' 
        });
      }
      
      return res.status(401).json({ 
        status: 'error',
        message: 'Token tidak valid!' 
      });
    }
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki izin untuk mengakses resource ini!'
      });
    }
    
    const userRole = req.user.role.name;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki izin untuk mengakses resource ini!'
      });
    }
    
    next();
  };
};

exports.hasPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki izin untuk mengakses resource ini!'
      });
    }
    
    const userPermissions = req.user.role.permissions;
    
    if (!userPermissions || !userPermissions[requiredPermission]) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak memiliki izin untuk mengakses resource ini!'
      });
    }
    
    next();
  };
};