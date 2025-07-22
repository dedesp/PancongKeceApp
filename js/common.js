/**
 * Common Utilities for PancongKece
 * Unified utility functions to prevent code duplication
 */

class CommonUtils {
    constructor() {
        this.notificationTimeout = null;
        this.currency = 'id-ID';
        this.currencySymbol = 'Rp';
    }

    /**
     * Show success message with animation
     * @param {string} message - Success message
     * @param {string} type - Message type ('success', 'error', 'warning', 'info')
     * @param {number} duration - Display duration in milliseconds
     */
    showSuccess(message, type = 'success', duration = 3000) {
        // Remove existing notification
        this.hideNotification();

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon hgi-stroke ${this.getIcon(type)}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="commonUtils.hideNotification()">
                    <i class="hgi-stroke hgi-cancel-01"></i>
                </button>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);

        // Auto hide
        if (duration > 0) {
            this.notificationTimeout = setTimeout(() => {
                this.hideNotification();
            }, duration);
        }

        return notification;
    }

    /**
     * Show error message (alias for showSuccess with error type)
     * @param {string} message - Error message
     * @param {number} duration - Display duration
     */
    showError(message, duration = 4000) {
        return this.showSuccess(message, 'error', duration);
    }

    /**
     * Show warning message
     * @param {string} message - Warning message
     * @param {number} duration - Display duration
     */
    showWarning(message, duration = 3500) {
        return this.showSuccess(message, 'warning', duration);
    }

    /**
     * Show info message
     * @param {string} message - Info message
     * @param {number} duration - Display duration
     */
    showInfo(message, duration = 3000) {
        return this.showSuccess(message, 'info', duration);
    }

    /**
     * Hide current notification
     */
    hideNotification() {
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.classList.remove('show');
            setTimeout(() => {
                if (existing.parentNode) {
                    existing.parentNode.removeChild(existing);
                }
            }, 300);
        }

        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = null;
        }
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon class
     */
    getIcon(type) {
        const icons = {
            success: 'hgi-tick-02',
            error: 'hgi-alert-circle',
            warning: 'hgi-alert-triangle',
            info: 'hgi-information-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Format currency value
     * @param {number} amount - Amount to format
     * @param {boolean} includeCurrency - Include currency symbol
     * @returns {string} Formatted currency
     */
    formatCurrency(amount, includeCurrency = true) {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return includeCurrency ? `${this.currencySymbol} 0` : '0';
        }

        const formatted = Math.abs(amount).toLocaleString(this.currency);
        const sign = amount < 0 ? '-' : '';
        
        return includeCurrency ? `${sign}${this.currencySymbol} ${formatted}` : `${sign}${formatted}`;
    }

    /**
     * Parse currency string to number
     * @param {string} currencyString - Currency string to parse
     * @returns {number} Parsed amount
     */
    parseCurrency(currencyString) {
        if (typeof currencyString !== 'string') {
            return parseFloat(currencyString) || 0;
        }

        // Remove currency symbol and spaces, handle negative
        const cleaned = currencyString
            .replace(this.currencySymbol, '')
            .replace(/[\s.]/g, '')
            .replace(',', '.');

        return parseFloat(cleaned) || 0;
    }

    /**
     * Format date to Indonesian format
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type ('short', 'medium', 'long', 'time')
     * @returns {string} Formatted date
     */
    formatDate(date, format = 'medium') {
        const dateObj = date instanceof Date ? date : new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }

        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            medium: { day: '2-digit', month: 'short', year: 'numeric' },
            long: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
            datetime: { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit'
            }
        };

        return dateObj.toLocaleDateString('id-ID', options[format] || options.medium);
    }

    /**
     * Generate unique ID
     * @param {string} prefix - ID prefix
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}-${timestamp}-${random}`;
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Validate phone number (Indonesian format)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} Is valid phone
     */
    isValidPhone(phone) {
        const regex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
        return regex.test(phone.replace(/[\s-]/g, ''));
    }

    /**
     * Sanitize HTML content
     * @param {string} html - HTML content to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * Deep clone object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * Download data as file
     * @param {string} data - Data to download
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    downloadFile(data, filename, mimeType = 'text/plain') {
        const blob = new Blob([data], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
    }

    /**
     * Export data to CSV
     * @param {Array} data - Array of objects to export
     * @param {string} filename - CSV filename
     * @param {Array} columns - Column configuration
     */
    exportToCSV(data, filename, columns = null) {
        if (!data || data.length === 0) {
            this.showWarning('Tidak ada data untuk diekspor');
            return;
        }

        // Auto-detect columns if not provided
        if (!columns) {
            columns = Object.keys(data[0]).map(key => ({ key, header: key }));
        }

        // Create CSV header
        let csv = columns.map(col => `"${col.header}"`).join(',') + '\n';

        // Create CSV rows
        data.forEach(row => {
            const csvRow = columns.map(col => {
                const value = row[col.key];
                const stringValue = value === null || value === undefined ? '' : String(value);
                return `"${stringValue.replace(/"/g, '""')}"`;
            }).join(',');
            csv += csvRow + '\n';
        });

        this.downloadFile(csv, filename, 'text/csv');
        this.showSuccess(`Data berhasil diekspor ke ${filename}`);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'absolute';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            
            this.showSuccess('Teks berhasil disalin ke clipboard');
            return true;
        } catch (error) {
            this.showError('Gagal menyalin ke clipboard');
            return false;
        }
    }

    /**
     * Format number with thousand separators
     * @param {number} number - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(number) {
        return number.toLocaleString(this.currency);
    }

    /**
     * Calculate percentage
     * @param {number} value - Current value
     * @param {number} total - Total value
     * @param {number} decimals - Decimal places
     * @returns {string} Percentage string
     */
    calculatePercentage(value, total, decimals = 1) {
        if (total === 0) return '0%';
        const percentage = (value / total) * 100;
        return `${percentage.toFixed(decimals)}%`;
    }

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    }

    /**
     * Initialize notification styles if not present
     */
    initStyles() {
        if (document.querySelector('#common-utils-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'common-utils-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 300px;
                max-width: 500px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(100%);
                transition: all 0.3s ease;
                font-family: var(--font-family, inherit);
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                background: white;
                border-radius: 8px;
                border-left: 4px solid;
            }
            
            .notification-success .notification-content {
                border-left-color: #28a745;
                color: #155724;
            }
            
            .notification-error .notification-content {
                border-left-color: #dc3545;
                color: #721c24;
            }
            
            .notification-warning .notification-content {
                border-left-color: #ffc107;
                color: #856404;
            }
            
            .notification-info .notification-content {
                border-left-color: var(--secondary-green, #4a7c59);
                color: var(--primary-green, #2d5016);
            }
            
            .notification-icon {
                font-size: 18px;
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .notification-message {
                flex: 1;
                font-weight: 500;
            }
            
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                margin-left: 8px;
                opacity: 0.6;
                transition: opacity 0.2s ease;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Create global instance
const commonUtils = new CommonUtils();

// Initialize styles
document.addEventListener('DOMContentLoaded', () => {
    commonUtils.initStyles();
});

// Create global shortcuts for backward compatibility
window.showSuccess = (message, type, duration) => commonUtils.showSuccess(message, type, duration);
window.showError = (message, duration) => commonUtils.showError(message, duration);
window.showWarning = (message, duration) => commonUtils.showWarning(message, duration);
window.showInfo = (message, duration) => commonUtils.showInfo(message, duration);
window.formatCurrency = (amount, includeCurrency) => commonUtils.formatCurrency(amount, includeCurrency);
window.formatDate = (date, format) => commonUtils.formatDate(date, format);
window.copyToClipboard = (text) => commonUtils.copyToClipboard(text);

// Export for modules
window.commonUtils = commonUtils;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommonUtils;
}
