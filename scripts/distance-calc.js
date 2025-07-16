export class DistanceCalculator {
    static DISTANCE_CATEGORIES = {
        NEAR: { max: 1, color: '#FF0000', label: 'Near' },
        CLOSE: { max: 10, color: '#FF8000', label: 'Close' },
        FAR: { max: 25, color: '#FFFF00', label: 'Far' },
        DISTANT: { max: 100, color: '#80FF00', label: 'Distant' },
        REMOTE: { max: Infinity, color: '#00FF00', label: 'Remote' }
    };
    
    static calculateDistance(token1, token2) {
        if (!token1 || !token2) {
            console.warn('Movement Categories | Invalid tokens provided for distance calculation');
            return null;
        }
        
        if (!token1.document || !token2.document) {
            console.warn('Movement Categories | Tokens missing document data');
            return null;
        }
        
        const x1 = token1.document.x + (token1.document.width * canvas.grid.size) / 2;
        const y1 = token1.document.y + (token1.document.height * canvas.grid.size) / 2;
        const x2 = token2.document.x + (token2.document.width * canvas.grid.size) / 2;
        const y2 = token2.document.y + (token2.document.height * canvas.grid.size) / 2;
        
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        const pixelDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        const gridDistance = pixelDistance / canvas.grid.size;
        const realDistance = gridDistance * canvas.scene.grid.distance;
        
        return realDistance;
    }
    
    static getDistanceCategory(distance) {
        if (distance === null || distance === undefined || distance < 0) {
            return null;
        }
        
        const categories = Object.entries(this.DISTANCE_CATEGORIES);
        
        for (const [key, category] of categories) {
            if (distance <= category.max) {
                return {
                    key,
                    ...category,
                    distance
                };
            }
        }
        
        return {
            key: 'REMOTE',
            ...this.DISTANCE_CATEGORIES.REMOTE,
            distance
        };
    }
    
    static getValidTokens() {
        if (!canvas.tokens) {
            return [];
        }
        
        return canvas.tokens.placeables.filter(token => {
            return token.document && 
                   token.document.actorId && 
                   !token.document.hidden &&
                   token.isVisible;
        });
    }
    
    static getTokenRelationships(referenceToken) {
        if (!referenceToken) {
            return [];
        }
        
        const validTokens = this.getValidTokens();
        const relationships = [];
        
        for (const token of validTokens) {
            if (token.id === referenceToken.id) continue;
            
            const distance = this.calculateDistance(referenceToken, token);
            if (distance === null) continue;
            
            const category = this.getDistanceCategory(distance);
            if (!category) continue;
            
            relationships.push({
                token,
                distance,
                category
            });
        }
        
        return relationships;
    }
    
    static isValidCoordinate(x, y) {
        return typeof x === 'number' && 
               typeof y === 'number' && 
               !isNaN(x) && 
               !isNaN(y) && 
               isFinite(x) && 
               isFinite(y);
    }
}