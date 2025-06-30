const { 
  SentimentAnalysis, 
  CustomerFeedback, 
  CustomerCommunication,
  Customer,
  User,
  sequelize 
} = require('../models');

// Analyze feedback sentiment
exports.analyzeFeedbackSentiment = async (req, res) => {
  try {
    const { feedback_id } = req.params;
    
    const feedback = await CustomerFeedback.findByPk(feedback_id, {
      include: [
        {
          model: Customer,
          attributes: ['name', 'loyalty_tier']
        }
      ]
    });
    
    if (!feedback) {
      return res.status(404).json({
        status: 'error',
        message: 'Feedback tidak ditemukan'
      });
    }
    
    // Check if analysis already exists
    let analysis = await SentimentAnalysis.findOne({
      where: { feedback_id: feedback_id }
    });
    
    if (!analysis) {
      // Perform sentiment analysis
      const analysisResult = await performSentimentAnalysis(feedback.message, feedback.title);
      
      // Create analysis record
      analysis = await SentimentAnalysis.create({
        feedback_id: feedback_id,
        text_content: `${feedback.title || ''} ${feedback.message}`.trim(),
        sentiment_score: analysisResult.sentiment_score,
        sentiment_label: analysisResult.sentiment_label,
        confidence_score: analysisResult.confidence_score,
        emotions: analysisResult.emotions,
        keywords: analysisResult.keywords,
        topics: analysisResult.topics,
        urgency_level: analysisResult.urgency_level,
        auto_response_suggested: analysisResult.auto_response_suggested,
        action_recommendations: analysisResult.action_recommendations,
        analysis_engine: 'custom_model',
        processing_time_ms: analysisResult.processing_time
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: {
        feedback: feedback,
        sentiment_analysis: analysis
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

// Get sentiment analytics dashboard
exports.getSentimentDashboard = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Sentiment distribution
    const sentimentDistribution = await SentimentAnalysis.findAll({
      attributes: [
        'sentiment_label',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('AVG', sequelize.col('sentiment_score')), 'avg_score']
      ],
      where: {
        created_at: { [sequelize.Op.gte]: startDate }
      },
      group: ['sentiment_label'],
      raw: true
    });
    
    // Topic analysis
    const topicAnalysis = await SentimentAnalysis.findAll({
      attributes: ['topics', 'sentiment_label'],
      where: {
        created_at: { [sequelize.Op.gte]: startDate }
      }
    });
    
    // Process topic data
    const topicCounts = {};
    topicAnalysis.forEach(analysis => {
      if (analysis.topics && Array.isArray(analysis.topics)) {
        analysis.topics.forEach(topic => {
          if (!topicCounts[topic]) {
            topicCounts[topic] = { total: 0, positive: 0, negative: 0, neutral: 0 };
          }
          topicCounts[topic].total++;
          
          if (['positive', 'very_positive'].includes(analysis.sentiment_label)) {
            topicCounts[topic].positive++;
          } else if (['negative', 'very_negative'].includes(analysis.sentiment_label)) {
            topicCounts[topic].negative++;
          } else {
            topicCounts[topic].neutral++;
          }
        });
      }
    });
    
    // Urgency levels
    const urgencyLevels = await SentimentAnalysis.findAll({
      attributes: [
        'urgency_level',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [sequelize.Op.gte]: startDate }
      },
      group: ['urgency_level'],
      raw: true
    });
    
    // Average sentiment by customer tier
    const sentimentByTier = await sequelize.query(`
      SELECT 
        c.loyalty_tier,
        AVG(sa.sentiment_score) as avg_sentiment,
        COUNT(sa.id) as feedback_count
      FROM sentiment_analyses sa
      JOIN customer_feedbacks cf ON sa.feedback_id = cf.id
      JOIN customers c ON cf.customer_id = c.id
      WHERE sa.created_at >= :startDate
      GROUP BY c.loyalty_tier
    `, {
      replacements: { startDate },
      type: sequelize.QueryTypes.SELECT
    });
    
    // Recent negative feedback requiring attention
    const negativeThreshold = -0.3;
    const negativeFeedback = await SentimentAnalysis.findAll({
      where: {
        sentiment_score: { [sequelize.Op.lte]: negativeThreshold },
        created_at: { [sequelize.Op.gte]: startDate }
      },
      include: [
        {
          model: CustomerFeedback,
          include: [
            {
              model: Customer,
              attributes: ['name', 'loyalty_tier', 'phone']
            }
          ]
        }
      ],
      order: [['sentiment_score', 'ASC']],
      limit: 10
    });
    
    return res.status(200).json({
      status: 'success',
      data: {
        sentiment_distribution: sentimentDistribution,
        topic_analysis: Object.entries(topicCounts).map(([topic, data]) => ({
          topic,
          ...data
        })),
        urgency_levels: urgencyLevels,
        sentiment_by_tier: sentimentByTier,
        negative_feedback_alerts: negativeFeedback
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

// Bulk analyze pending feedback
exports.bulkAnalyzeFeedback = async (req, res) => {
  try {
    // Find feedback without sentiment analysis
    const pendingFeedback = await CustomerFeedback.findAll({
      where: {
        '$SentimentAnalysis.id$': null
      },
      include: [
        {
          model: SentimentAnalysis,
          required: false
        }
      ],
      limit: 50 // Process in batches
    });
    
    let processedCount = 0;
    const startTime = Date.now();
    
    for (const feedback of pendingFeedback) {
      try {
        const analysisResult = await performSentimentAnalysis(feedback.message, feedback.title);
        
        await SentimentAnalysis.create({
          feedback_id: feedback.id,
          text_content: `${feedback.title || ''} ${feedback.message}`.trim(),
          sentiment_score: analysisResult.sentiment_score,
          sentiment_label: analysisResult.sentiment_label,
          confidence_score: analysisResult.confidence_score,
          emotions: analysisResult.emotions,
          keywords: analysisResult.keywords,
          topics: analysisResult.topics,
          urgency_level: analysisResult.urgency_level,
          auto_response_suggested: analysisResult.auto_response_suggested,
          action_recommendations: analysisResult.action_recommendations,
          analysis_engine: 'custom_model',
          processing_time_ms: analysisResult.processing_time
        });
        
        processedCount++;
        
      } catch (error) {
        console.error(`Failed to analyze feedback ${feedback.id}:`, error);
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    return res.status(200).json({
      status: 'success',
      message: `Berhasil menganalisis ${processedCount} feedback`,
      data: {
        processed_count: processedCount,
        total_pending: pendingFeedback.length,
        processing_time_ms: totalTime
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

// Mark sentiment analysis as reviewed
exports.reviewSentimentAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const { human_feedback, is_accurate } = req.body;
    
    const analysis = await SentimentAnalysis.findByPk(id);
    
    if (!analysis) {
      return res.status(404).json({
        status: 'error',
        message: 'Sentiment analysis tidak ditemukan'
      });
    }
    
    await analysis.update({
      is_reviewed: true,
      human_feedback: human_feedback || null,
      reviewed_by: req.user.id,
      reviewed_at: new Date()
    });
    
    return res.status(200).json({
      status: 'success',
      message: 'Review sentiment analysis berhasil disimpan',
      data: analysis
    });
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// Perform sentiment analysis (mock implementation)
async function performSentimentAnalysis(text, title = '') {
  const startTime = Date.now();
  
  // Combine title and text
  const fullText = `${title} ${text}`.toLowerCase().trim();
  
  // Mock sentiment analysis logic
  const positiveWords = ['enak', 'bagus', 'mantap', 'lezat', 'puas', 'suka', 'rekomendasi', 'terbaik', 'nyaman', 'ramah'];
  const negativeWords = ['buruk', 'jelek', 'kecewa', 'mahal', 'lama', 'kotor', 'tidak', 'benci', 'gagal', 'rusak'];
  const serviceWords = ['pelayanan', 'service', 'kasir', 'staff', 'karyawan', 'waitress'];
  const foodWords = ['makanan', 'pancong', 'rasa', 'menu', 'masak', 'porsi'];
  const priceWords = ['harga', 'mahal', 'murah', 'nilai', 'bayar'];
  
  // Calculate sentiment score
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (fullText.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (fullText.includes(word)) negativeScore++;
  });
  
  const totalWords = positiveScore + negativeScore;
  let sentimentScore = 0;
  
  if (totalWords > 0) {
    sentimentScore = (positiveScore - negativeScore) / Math.max(totalWords, 3);
  }
  
  // Determine sentiment label
  let sentimentLabel;
  if (sentimentScore >= 0.5) sentimentLabel = 'very_positive';
  else if (sentimentScore >= 0.1) sentimentLabel = 'positive';
  else if (sentimentScore >= -0.1) sentimentLabel = 'neutral';
  else if (sentimentScore >= -0.5) sentimentLabel = 'negative';
  else sentimentLabel = 'very_negative';
  
  // Extract topics
  const topics = [];
  if (serviceWords.some(word => fullText.includes(word))) topics.push('service');
  if (foodWords.some(word => fullText.includes(word))) topics.push('food_quality');
  if (priceWords.some(word => fullText.includes(word))) topics.push('price');
  if (fullText.includes('tempat') || fullText.includes('suasana')) topics.push('ambiance');
  if (topics.length === 0) topics.push('general');
  
  // Extract keywords
  const keywords = [];
  positiveWords.forEach(word => {
    if (fullText.includes(word)) keywords.push({ word, sentiment: 'positive' });
  });
  negativeWords.forEach(word => {
    if (fullText.includes(word)) keywords.push({ word, sentiment: 'negative' });
  });
  
  // Determine urgency
  let urgencyLevel = 'low';
  if (sentimentScore <= -0.5 && negativeScore >= 2) urgencyLevel = 'critical';
  else if (sentimentScore <= -0.3) urgencyLevel = 'high';
  else if (sentimentScore <= -0.1) urgencyLevel = 'medium';
  
  // Generate auto response
  let autoResponse = '';
  if (sentimentScore >= 0.3) {
    autoResponse = 'Terima kasih atas feedback positif Anda! Kami senang Anda menikmati pengalaman di Pancong Kece.';
  } else if (sentimentScore <= -0.3) {
    autoResponse = 'Terima kasih atas feedback Anda. Kami akan menindaklanjuti keluhan ini untuk perbaikan layanan kami.';
  } else {
    autoResponse = 'Terima kasih atas feedback Anda. Masukan Anda sangat berharga untuk pengembangan layanan kami.';
  }
  
  // Action recommendations
  const actionRecommendations = [];
  if (urgencyLevel === 'critical') {
    actionRecommendations.push('Hubungi customer dalam 24 jam');
    actionRecommendations.push('Eskalasi ke manager');
  }
  if (topics.includes('service')) {
    actionRecommendations.push('Review training staff');
  }
  if (topics.includes('food_quality')) {
    actionRecommendations.push('Review kualitas produk');
  }
  if (sentimentScore >= 0.5) {
    actionRecommendations.push('Potensial untuk testimoni');
  }
  
  const processingTime = Date.now() - startTime;
  
  return {
    sentiment_score: Math.round(sentimentScore * 100) / 100,
    sentiment_label: sentimentLabel,
    confidence_score: Math.min(0.85 + Math.random() * 0.1, 0.95),
    emotions: {
      joy: sentimentScore > 0 ? Math.min(sentimentScore + 0.1, 1) : 0,
      anger: sentimentScore < -0.3 ? Math.abs(sentimentScore) : 0,
      sadness: sentimentScore < -0.1 ? Math.abs(sentimentScore * 0.7) : 0
    },
    keywords: keywords,
    topics: topics,
    urgency_level: urgencyLevel,
    auto_response_suggested: autoResponse,
    action_recommendations: actionRecommendations,
    processing_time: processingTime
  };
}