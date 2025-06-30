const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SentimentAnalysis = sequelize.define('sentiment_analyses', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  feedback_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customer_feedbacks',
      key: 'id'
    }
  },
  communication_id: {
    type: DataTypes.UUID,
    references: {
      model: 'customer_communications',
      key: 'id'
    }
  },
  text_content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Text yang dianalisis'
  },
  sentiment_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    validate: {
      min: -1.0,
      max: 1.0
    },
    comment: 'Score sentiment: -1 (sangat negatif) to 1 (sangat positif)'
  },
  sentiment_label: {
    type: DataTypes.ENUM('very_negative', 'negative', 'neutral', 'positive', 'very_positive'),
    allowNull: false
  },
  confidence_score: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    validate: {
      min: 0.0,
      max: 1.0
    },
    comment: 'Confidence level of the analysis (0-1)'
  },
  emotions: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'Detected emotions with scores: joy, anger, fear, sadness, etc.'
  },
  keywords: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Extracted keywords and key phrases'
  },
  topics: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Detected topics/categories: food, service, price, etc.'
  },
  urgency_level: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'low',
    comment: 'Urgency level based on sentiment and content'
  },
  auto_response_suggested: {
    type: DataTypes.TEXT,
    comment: 'AI-suggested response template'
  },
  action_recommendations: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Recommended actions based on analysis'
  },
  analysis_engine: {
    type: DataTypes.ENUM('openai_gpt', 'azure_cognitive', 'google_nlp', 'custom_model'),
    defaultValue: 'custom_model'
  },
  analysis_version: {
    type: DataTypes.STRING,
    defaultValue: '1.0'
  },
  processing_time_ms: {
    type: DataTypes.INTEGER,
    comment: 'Analysis processing time in milliseconds'
  },
  is_reviewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether human has reviewed the analysis'
  },
  human_feedback: {
    type: DataTypes.TEXT,
    comment: 'Human feedback on analysis accuracy'
  },
  reviewed_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE
  }
});

module.exports = SentimentAnalysis;