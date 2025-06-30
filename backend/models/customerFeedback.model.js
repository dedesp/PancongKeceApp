const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomerFeedback = sequelize.define('customer_feedbacks', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  transaction_id: {
    type: DataTypes.UUID,
    references: {
      model: 'transactions',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('review', 'complaint', 'suggestion', 'compliment', 'survey_response'),
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Rating 1-5 bintang'
  },
  title: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('food_quality', 'service', 'ambiance', 'price', 'cleanliness', 'staff', 'general'),
    defaultValue: 'general'
  },
  status: {
    type: DataTypes.ENUM('new', 'acknowledged', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'new'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  response: {
    type: DataTypes.TEXT
  },
  response_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  response_at: {
    type: DataTypes.DATE
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Apakah feedback bisa ditampilkan public'
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Apakah feedback ditampilkan sebagai testimoni'
  },
  source: {
    type: DataTypes.ENUM('in_app', 'google_review', 'social_media', 'email', 'phone', 'in_person'),
    defaultValue: 'in_app'
  },
  media_urls: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Array of image/video URLs'
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
});

module.exports = CustomerFeedback;