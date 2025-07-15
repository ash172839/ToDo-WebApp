export const RegexValidator = {
    patterns: {
        id: /^[0-9]+$/ 
    },

    validate(field, value) {
        const pattern = this.patterns[field];
        if (!pattern) {
            if(pattern==='id'){
                console.warn(`⚠️ No pattern defined for field: ${field}`);
            }
            
            return true; 
        }
        return pattern.test(value.trim());
    }
};