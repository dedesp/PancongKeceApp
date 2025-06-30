const { SystemLog } = require('../models');

exports.logActivity = (module) => {
  return async (req, res, next) => {
    // Store the original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    const originalStatus = res.status;
    
    let statusCode = 200;
    
    // Override status method
    res.status = function(code) {
      statusCode = code;
      return originalStatus.apply(res, arguments);
    };
    
    // Function to log activity
    const logData = async (data, method) => {
      try {
        // Don't log system logs routes to avoid infinite loops
        if (req.originalUrl.includes('/api/system-logs')) {
          return method === 'json' ? originalJson.call(res, data) : originalSend.call(res, data);
        }
        
        const userId = req.user ? req.user.id : null;
        let status = 'info';
        
        if (statusCode >= 500) {
          status = 'failure';
        } else if (statusCode >= 400) {
          status = 'warning';
        } else if (statusCode >= 200 && statusCode < 300) {
          status = 'success';
        }
        
        // Prepare details
        const details = {
          endpoint: req.originalUrl,
          method: req.method,
          requestBody: req.method !== 'GET' ? req.body : undefined,
          responseStatus: statusCode,
          responseData: typeof data === 'object' ? data : undefined
        };
        
        // Create activity log
        await SystemLog.create({
          user_id: userId,
          action: req.method,
          module: module,
          description: `${req.method} ${req.originalUrl}`,
          ip_address: req.ip,
          user_agent: req.headers['user-agent'],
          details: details,
          status: status
        });
      } catch (err) {
        console.error('Error logging activity:', err);
      }
      
      // Call the original method
      return method === 'json' ? originalJson.call(res, data) : originalSend.call(res, data);
    };
    
    // Override send
    res.send = function(data) {
      return logData(data, 'send');
    };
    
    // Override json
    res.json = function(data) {
      return logData(data, 'json');
    };
    
    next();
  };
};