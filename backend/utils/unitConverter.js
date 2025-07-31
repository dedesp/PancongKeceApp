/**
 * Unit Converter Utility for Sajati Smart System
 * Handles automatic unit conversion, especially for water (Air)
 * 
 * IMPORTANT: Water conversion rule - 1 Gram = 1 ml
 */

class UnitConverter {
    constructor(db) {
        this.db = db;
        this.conversionRules = new Map();
        this.loadConversionRules();
    }

    /**
     * Load conversion rules from database
     */
    async loadConversionRules() {
        try {
            const rules = await this.db.all(
                'SELECT material_name, from_unit, to_unit, conversion_factor FROM unit_conversions'
            );
            
            rules.forEach(rule => {
                const key = `${rule.material_name}_${rule.from_unit}_${rule.to_unit}`;
                this.conversionRules.set(key, rule.conversion_factor);
            });
            
            console.log(`Loaded ${rules.length} conversion rules`);
        } catch (error) {
            console.error('Error loading conversion rules:', error);
        }
    }

    /**
     * Convert quantity from one unit to another for specific material
     * @param {string} materialName - Name of the material
     * @param {number} quantity - Quantity to convert
     * @param {string} fromUnit - Source unit
     * @param {string} toUnit - Target unit
     * @returns {number} Converted quantity
     */
    convert(materialName, quantity, fromUnit, toUnit) {
        // If units are the same, no conversion needed
        if (fromUnit === toUnit) {
            return quantity;
        }

        const conversionKey = `${materialName}_${fromUnit}_${toUnit}`;
        const conversionFactor = this.conversionRules.get(conversionKey);

        if (conversionFactor !== undefined) {
            return quantity * conversionFactor;
        }

        // Special case for water (Air) - hardcoded fallback
        if (materialName === 'Air') {
            if ((fromUnit === 'Gram' && toUnit === 'ml') || 
                (fromUnit === 'ml' && toUnit === 'Gram')) {
                return quantity * 1.0; // 1:1 conversion
            }
        }

        console.warn(`No conversion rule found for ${materialName} from ${fromUnit} to ${toUnit}`);
        return quantity; // Return original if no conversion rule
    }

    /**
     * Normalize water units to ml for inventory calculations
     * @param {string} materialName - Name of the material
     * @param {number} quantity - Quantity
     * @param {string} unit - Current unit
     * @returns {object} {quantity, unit} normalized values
     */
    normalizeWaterUnit(materialName, quantity, unit) {
        if (materialName === 'Air' && unit === 'Gram') {
            return {
                quantity: this.convert(materialName, quantity, 'Gram', 'ml'),
                unit: 'ml'
            };
        }
        return { quantity, unit };
    }

    /**
     * Calculate total water requirement from recipe in normalized units (ml)
     * @param {Array} recipeIngredients - Array of recipe ingredients
     * @returns {number} Total water requirement in ml
     */
    calculateWaterRequirement(recipeIngredients) {
        let totalWaterMl = 0;

        recipeIngredients.forEach(ingredient => {
            if (ingredient.material_name === 'Air') {
                const normalized = this.normalizeWaterUnit(
                    ingredient.material_name,
                    ingredient.quantity,
                    ingredient.unit
                );
                totalWaterMl += normalized.quantity;
            }
        });

        return totalWaterMl;
    }

    /**
     * Convert recipe requirements to inventory units for stock checking
     * @param {Array} recipeIngredients - Array of recipe ingredients
     * @returns {Array} Array of ingredients with inventory units
     */
    convertRecipeToInventoryUnits(recipeIngredients) {
        return recipeIngredients.map(ingredient => {
            const inventoryUnit = this.getInventoryUnit(ingredient.material_name, ingredient.unit);
            const convertedQuantity = this.convert(
                ingredient.material_name,
                ingredient.quantity,
                ingredient.unit,
                inventoryUnit
            );

            return {
                ...ingredient,
                inventory_quantity: convertedQuantity,
                inventory_unit: inventoryUnit,
                original_quantity: ingredient.quantity,
                original_unit: ingredient.unit
            };
        });
    }

    /**
     * Convert inventory stock to recipe units for calculation
     * @param {Array} inventoryItems - Array of inventory items
     * @returns {Array} Array of inventory items with recipe units
     */
    convertInventoryToRecipeUnits(inventoryItems) {
        return inventoryItems.map(item => {
            const recipeUnit = this.getRecipeUnit(item.material_name, item.unit);
            const convertedQuantity = this.convert(
                item.material_name,
                item.quantity,
                item.unit,
                recipeUnit
            );

            return {
                ...item,
                recipe_quantity: convertedQuantity,
                recipe_unit: recipeUnit,
                inventory_quantity: item.quantity,
                inventory_unit: item.unit
            };
        });
    }

    /**
     * Get the standard inventory unit for a material
     * @param {string} materialName - Name of the material
     * @param {string} currentUnit - Current unit
     * @returns {string} Standard inventory unit
     */
    getInventoryUnit(materialName, currentUnit) {
        // Define standard inventory units based on material type
        const inventoryUnitMap = {
            'Sosis Sapi': 'Pack',
            'Beras': 'Kg',
            'Beans Geisha V60': 'Kg',
            'Beans Reguler V60': 'Kg',
            'Beans Seasonal V60': 'Kg',
            'Ayam Suwir Besar': 'Kg',
            'Ayam Suwir Kecil': 'Kg',
            'Beef Slice': 'Kg',
            'Cheddar Cheese': 'Pack',
            'Slice Cheese': 'Pack',
            'Telur Ayam': 'Tray',
            'Roti Tawar Tebal': 'Loaf',
            'Roti Tawar Tipis': 'Loaf',
            'Air': 'ml'
        };

        return inventoryUnitMap[materialName] || currentUnit;
    }

    /**
     * Get the standard recipe unit for a material
     * @param {string} materialName - Name of the material
     * @param {string} currentUnit - Current unit
     * @returns {string} Standard recipe unit
     */
    getRecipeUnit(materialName, currentUnit) {
        // Define standard recipe units based on material type
        const recipeUnitMap = {
            'Sosis Sapi': 'Pcs',
            'Beras': 'Gram',
            'Beans Geisha V60': 'Gram',
            'Beans Reguler V60': 'Gram',
            'Beans Seasonal V60': 'Gram',
            'Ayam Suwir Besar': 'Gram',
            'Ayam Suwir Kecil': 'Gram',
            'Beef Slice': 'Gram',
            'Cheddar Cheese': 'Pcs',
            'Slice Cheese': 'Pcs',
            'Telur Ayam': 'Pcs',
            'Roti Tawar Tebal': 'Pcs',
            'Roti Tawar Tipis': 'Pcs',
            'Air': 'ml'
        };

        return recipeUnitMap[materialName] || currentUnit;
    }

    /**
     * Check if there's enough stock for recipe requirements
     * @param {Array} recipeRequirements - Recipe requirements in recipe units
     * @param {Array} currentStock - Current stock in inventory units
     * @returns {Object} Stock check result
     */
    checkStockAvailability(recipeRequirements, currentStock) {
        const stockMap = new Map();
        const shortages = [];
        const available = [];

        // Convert current stock to recipe units for comparison
        currentStock.forEach(stock => {
            const recipeEquivalent = this.convert(
                stock.material_name,
                stock.quantity,
                stock.unit,
                this.getRecipeUnit(stock.material_name, stock.unit)
            );
            stockMap.set(stock.material_name, recipeEquivalent);
        });

        // Check each recipe requirement
        recipeRequirements.forEach(requirement => {
            const availableStock = stockMap.get(requirement.material_name) || 0;
            const requiredQuantity = requirement.quantity;

            if (availableStock >= requiredQuantity) {
                available.push({
                    material_name: requirement.material_name,
                    required: requiredQuantity,
                    available: availableStock,
                    unit: requirement.unit
                });
            } else {
                shortages.push({
                    material_name: requirement.material_name,
                    required: requiredQuantity,
                    available: availableStock,
                    shortage: requiredQuantity - availableStock,
                    unit: requirement.unit
                });
            }
        });

        return {
            canProduce: shortages.length === 0,
            shortages,
            available,
            totalItems: recipeRequirements.length
        };
    }

    /**
     * Check if material has conversion rules
     * @param {string} materialName - Name of the material
     * @returns {boolean}
     */
    hasConversionRules(materialName) {
        for (let key of this.conversionRules.keys()) {
            if (key.startsWith(materialName + '_')) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get all available conversion rules for a material
     * @param {string} materialName - Name of the material
     * @returns {Array} Array of conversion rules
     */
    getConversionRulesForMaterial(materialName) {
        const rules = [];
        for (let [key, factor] of this.conversionRules.entries()) {
            if (key.startsWith(materialName + '_')) {
                const [material, fromUnit, toUnit] = key.split('_');
                rules.push({ fromUnit, toUnit, factor });
            }
        }
        return rules;
    }
}

module.exports = UnitConverter;