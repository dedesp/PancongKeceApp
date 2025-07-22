/**
 * Component Loader System for PancongKece
 * Handles dynamic loading of HTML components for better performance
 */

class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loadedComponents = new Set();
        this.isLoading = new Set();
    }

    /**
     * Load component HTML from file
     * @param {string} componentPath - Path to component file
     * @returns {Promise<string>} Component HTML
     */
    async loadComponent(componentPath) {
        // Check cache first
        if (this.cache.has(componentPath)) {
            return this.cache.get(componentPath);
        }

        // Check if already loading to prevent duplicate requests
        if (this.isLoading.has(componentPath)) {
            return new Promise((resolve) => {
                const checkLoaded = () => {
                    if (this.cache.has(componentPath)) {
                        resolve(this.cache.get(componentPath));
                    } else {
                        setTimeout(checkLoaded, 10);
                    }
                };
                checkLoaded();
            });
        }

        this.isLoading.add(componentPath);

        try {
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`Failed to load component: ${componentPath} (${response.status})`);
            }
            
            const html = await response.text();
            
            // Cache the component
            this.cache.set(componentPath, html);
            this.loadedComponents.add(componentPath);
            
            return html;
        } catch (error) {
            console.error(`Error loading component ${componentPath}:`, error);
            return `<div class="error">Failed to load component: ${componentPath}</div>`;
        } finally {
            this.isLoading.delete(componentPath);
        }
    }

    /**
     * Render component into container
     * @param {string} componentPath - Path to component file
     * @param {HTMLElement|string} container - Container element or selector
     * @param {Object} data - Data to pass to component
     * @returns {Promise<void>}
     */
    async renderComponent(componentPath, container, data = {}) {
        const containerElement = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;

        if (!containerElement) {
            console.error(`Container not found: ${container}`);
            return;
        }

        // Show loading indicator
        containerElement.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';

        try {
            const html = await this.loadComponent(componentPath);
            
            // Replace placeholders with data
            let processedHTML = this.processTemplate(html, data);
            
            containerElement.innerHTML = processedHTML;
            
            // Trigger component loaded event
            containerElement.dispatchEvent(new CustomEvent('componentLoaded', {
                detail: { componentPath, data }
            }));
            
        } catch (error) {
            console.error(`Error rendering component ${componentPath}:`, error);
            containerElement.innerHTML = `<div class="alert alert-danger">Error loading component</div>`;
        }
    }

    /**
     * Process template with data placeholders
     * @param {string} template - HTML template
     * @param {Object} data - Data object
     * @returns {string} Processed HTML
     */
    processTemplate(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    }

    /**
     * Preload components for better performance
     * @param {string[]} componentPaths - Array of component paths to preload
     */
    async preloadComponents(componentPaths) {
        const loadPromises = componentPaths.map(path => this.loadComponent(path));
        await Promise.all(loadPromises);
        console.log('Components preloaded:', componentPaths);
    }

    /**
     * Clear component cache
     * @param {string} componentPath - Optional specific component to clear
     */
    clearCache(componentPath = null) {
        if (componentPath) {
            this.cache.delete(componentPath);
            this.loadedComponents.delete(componentPath);
        } else {
            this.cache.clear();
            this.loadedComponents.clear();
        }
    }

    /**
     * Get loading status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            cached: Array.from(this.loadedComponents),
            loading: Array.from(this.isLoading),
            cacheSize: this.cache.size
        };
    }
}

// Create global instance
window.componentLoader = new ComponentLoader();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentLoader;
}
