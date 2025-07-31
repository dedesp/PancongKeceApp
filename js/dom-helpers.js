/**
 * DOM Helper Utilities for Sajati Smart System
 * Optimized DOM operations and caching system
 */

class DOMCache {
    constructor() {
        this.cache = new Map();
        this.observedElements = new WeakMap();
    }

    /**
     * Get cached DOM element
     * @param {string} selector - CSS selector
     * @param {boolean} forceRefresh - Force cache refresh
     * @returns {Element|null} DOM element
     */
    get(selector, forceRefresh = false) {
        if (forceRefresh || !this.cache.has(selector)) {
            const element = document.querySelector(selector);
            if (element) {
                this.cache.set(selector, element);
            }
            return element;
        }
        
        // Verify element is still in DOM
        const cachedElement = this.cache.get(selector);
        if (cachedElement && !document.contains(cachedElement)) {
            this.cache.delete(selector);
            return this.get(selector, true);
        }
        
        return cachedElement;
    }

    /**
     * Get multiple elements (cached)
     * @param {string} selector - CSS selector
     * @param {boolean} forceRefresh - Force cache refresh
     * @returns {NodeList} DOM elements
     */
    getAll(selector, forceRefresh = false) {
        const cacheKey = `all:${selector}`;
        
        if (forceRefresh || !this.cache.has(cacheKey)) {
            const elements = document.querySelectorAll(selector);
            this.cache.set(cacheKey, elements);
            return elements;
        }
        
        return this.cache.get(cacheKey);
    }

    /**
     * Clear cache for specific selector or all
     * @param {string} selector - Optional selector to clear
     */
    clearCache(selector = null) {
        if (selector) {
            this.cache.delete(selector);
            this.cache.delete(`all:${selector}`);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Get cache status
     * @returns {Object} Cache statistics
     */
    getStatus() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

/**
 * DOM Helper Functions
 */
class DOMHelpers {
    constructor() {
        this.cache = new DOMCache();
        this.eventListeners = new WeakMap();
    }

    /**
     * Safe element selection with caching
     * @param {string} selector - CSS selector
     * @param {boolean} useCache - Use cached element
     * @returns {Element|null} DOM element
     */
    $(selector, useCache = true) {
        return useCache ? this.cache.get(selector) : document.querySelector(selector);
    }

    /**
     * Safe multiple element selection
     * @param {string} selector - CSS selector
     * @param {boolean} useCache - Use cached elements
     * @returns {NodeList} DOM elements
     */
    $$(selector, useCache = true) {
        return useCache ? this.cache.getAll(selector) : document.querySelectorAll(selector);
    }

    /**
     * Create element with attributes and content
     * @param {string} tag - HTML tag name
     * @param {Object} attributes - Element attributes
     * @param {string|Element[]} content - Element content
     * @returns {Element} Created element
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });

        // Set content
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (Array.isArray(content)) {
            content.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Element) {
                    element.appendChild(child);
                }
            });
        } else if (content instanceof Element) {
            element.appendChild(content);
        }

        return element;
    }

    /**
     * Safe event listener with cleanup tracking
     * @param {Element|string} element - Element or selector
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    on(element, event, handler, options = {}) {
        const target = typeof element === 'string' ? this.$(element) : element;
        if (!target) return;

        target.addEventListener(event, handler, options);

        // Track for cleanup
        if (!this.eventListeners.has(target)) {
            this.eventListeners.set(target, []);
        }
        this.eventListeners.get(target).push({ event, handler, options });
    }

    /**
     * Remove event listener
     * @param {Element|string} element - Element or selector
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    off(element, event, handler) {
        const target = typeof element === 'string' ? this.$(element) : element;
        if (!target) return;

        target.removeEventListener(event, handler);

        // Update tracking
        if (this.eventListeners.has(target)) {
            const listeners = this.eventListeners.get(target);
            const index = listeners.findIndex(l => l.event === event && l.handler === handler);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Toggle element visibility with animation
     * @param {Element|string} element - Element or selector
     * @param {boolean} show - Show or hide
     * @param {string} animation - Animation class
     */
    toggle(element, show = null, animation = 'fadeIn') {
        const target = typeof element === 'string' ? this.$(element) : element;
        if (!target) return;

        const isVisible = target.style.display !== 'none' && !target.hasAttribute('hidden');
        const shouldShow = show !== null ? show : !isVisible;

        if (shouldShow) {
            target.style.display = '';
            target.removeAttribute('hidden');
            if (animation) {
                target.style.animation = `${animation} 0.3s ease`;
            }
        } else {
            if (animation) {
                target.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    target.style.display = 'none';
                    target.setAttribute('hidden', '');
                }, 300);
            } else {
                target.style.display = 'none';
                target.setAttribute('hidden', '');
            }
        }
    }

    /**
     * Safe innerHTML with XSS protection
     * @param {Element|string} element - Element or selector
     * @param {string} html - HTML content
     * @param {boolean} sanitize - Sanitize content
     */
    setHTML(element, html, sanitize = true) {
        const target = typeof element === 'string' ? this.$(element) : element;
        if (!target) return;

        if (sanitize) {
            // Basic XSS protection - remove script tags and event handlers
            const sanitized = html
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '')
                .replace(/on\w+='[^']*'/gi, '')
                .replace(/javascript:/gi, '');
            target.innerHTML = sanitized;
        } else {
            target.innerHTML = html;
        }
    }

    /**
     * Debounced function execution
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, delay = 300) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttled function execution
     * @param {Function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, delay = 100) {
        let lastExecution = 0;
        return function (...args) {
            const now = Date.now();
            if (now - lastExecution >= delay) {
                func.apply(this, args);
                lastExecution = now;
            }
        };
    }

    /**
     * Wait for DOM element to exist
     * @param {string} selector - CSS selector
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Element>} Promise resolving to element
     */
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = this.$(selector, false);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = this.$(selector, false);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }

    /**
     * Clean up all event listeners and cache
     */
    cleanup() {
        // Remove all tracked event listeners
        this.eventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });

        this.eventListeners = new WeakMap();
        this.cache.clearCache();
    }
}

// Create global instance
window.domHelpers = new DOMHelpers();
window.domCache = window.domHelpers.cache;

// Shortcut functions
window.$ = (selector) => window.domHelpers.$(selector);
window.$$ = (selector) => window.domHelpers.$$(selector);

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DOMHelpers, DOMCache };
}
