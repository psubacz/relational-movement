import { DistanceCalculator } from './distance-calc.js';

export class TokenStateMatrix {
    static MODULE_ID = 'relational-movement';
    
    constructor() {
        this.stateMatrix = new Map(); // token.id -> Map(otherToken.id -> relationshipState)
        this.previousStates = new Map(); // for tracking changes
    }
    
    /**
     * Update the state matrix for all tokens
     */
    updateMatrix() {
        const tokens = canvas.tokens.placeables.filter(token => token.visible);
        
        // Store previous states
        this.previousStates = new Map(this.stateMatrix);
        this.stateMatrix.clear();
        
        for (const token of tokens) {
            const tokenStates = new Map();
            
            for (const otherToken of tokens) {
                if (token.id === otherToken.id) continue;
                
                const distance = DistanceCalculator.calculateDistance(token, otherToken);
                const category = DistanceCalculator.getDistanceCategory(distance);
                
                if (category && distance !== null) {
                    tokenStates.set(otherToken.id, {
                        category: category,
                        distance: distance,
                        lastUpdated: Date.now()
                    });
                }
            }
            
            this.stateMatrix.set(token.id, tokenStates);
        }
        
        this.notifyStateChanges();
    }
    
    /**
     * Get the relationship state between two tokens
     */
    getRelationship(tokenA, tokenB) {
        const statesA = this.stateMatrix.get(tokenA.id);
        if (!statesA) return null;
        
        return statesA.get(tokenB.id) || null;
    }
    
    /**
     * Get all relationships for a specific token
     */
    getTokenRelationships(token) {
        return this.stateMatrix.get(token.id) || new Map();
    }
    
    /**
     * Detect and notify about state changes
     */
    notifyStateChanges() {
        const changes = [];
        
        for (const [tokenId, currentStates] of this.stateMatrix) {
            const previousStates = this.previousStates.get(tokenId);
            if (!previousStates) continue;
            
            for (const [otherTokenId, currentState] of currentStates) {
                const previousState = previousStates.get(otherTokenId);
                
                if (previousState && previousState.category.key !== currentState.category.key) {
                    const tokenA = canvas.tokens.get(tokenId);
                    const tokenB = canvas.tokens.get(otherTokenId);
                    
                    if (tokenA && tokenB) {
                        changes.push({
                            tokenA,
                            tokenB,
                            previousCategory: previousState.category,
                            currentCategory: currentState.category,
                            direction: this.getMovementDirection(previousState.category, currentState.category)
                        });
                    }
                }
            }
        }
        
        if (changes.length > 0) {
            this.onStateChanges(changes);
        }
    }
    
    /**
     * Determine if movement was towards or away from another token
     */
    getMovementDirection(previousCategory, currentCategory) {
        const categories = ['NEAR', 'CLOSE', 'FAR', 'DISTANT', 'REMOTE'];
        const prevIndex = categories.indexOf(previousCategory.key);
        const currIndex = categories.indexOf(currentCategory.key);
        
        if (currIndex < prevIndex) return 'towards';
        if (currIndex > prevIndex) return 'away';
        return 'none';
    }
    
    /**
     * Handle state changes (can be customized for notifications, effects, etc.)
     */
    onStateChanges(changes) {
        console.log('Relational Movement | State changes detected:', changes);
        
        // Fire custom hook for other modules or features to listen to
        Hooks.callAll('relationalMovementStateChange', changes);
        
        // Optional: Show notifications for significant changes
        const showNotifications = game.settings.get(TokenStateMatrix.MODULE_ID, 'showStateNotifications');
        if (showNotifications) {
            changes.forEach(change => {
                const message = `${change.tokenA.name} moved ${change.direction} ${change.tokenB.name} (${change.previousCategory.key} → ${change.currentCategory.key})`;
                ui.notifications.info(message);
            });
        }
    }
    
    /**
     * Get the next category when advancing towards a token
     */
    getAdvanceCategory(currentCategory) {
        const categories = ['REMOTE', 'DISTANT', 'FAR', 'CLOSE', 'NEAR'];
        const currentIndex = categories.indexOf(currentCategory.key);
        
        if (currentIndex > 0) {
            return DistanceCalculator.getDistanceCategory(currentCategory.key === 'REMOTE' ? 90 : 
                                                        currentCategory.key === 'DISTANT' ? 20 :
                                                        currentCategory.key === 'FAR' ? 8 :
                                                        currentCategory.key === 'CLOSE' ? 0.5 : 0.5);
        }
        
        return currentCategory; // Already at closest
    }
    
    /**
     * Get the next category when retreating from a token
     */
    getRetreatCategory(currentCategory) {
        const categories = ['NEAR', 'CLOSE', 'FAR', 'DISTANT', 'REMOTE'];
        const currentIndex = categories.indexOf(currentCategory.key);
        
        if (currentIndex < categories.length - 1) {
            return DistanceCalculator.getDistanceCategory(currentCategory.key === 'NEAR' ? 5 :
                                                        currentCategory.key === 'CLOSE' ? 15 :
                                                        currentCategory.key === 'FAR' ? 50 :
                                                        currentCategory.key === 'DISTANT' ? 150 : 150);
        }
        
        return currentCategory; // Already at farthest
    }
    
    /**
     * Calculate optimal position to advance towards a target token
     */
    calculateAdvancePosition(sourceToken, targetToken) {
        const relationship = this.getRelationship(sourceToken, targetToken);
        if (!relationship) return null;
        
        const nextCategory = this.getAdvanceCategory(relationship.category);
        if (nextCategory.key === relationship.category.key) return null; // Already at closest
        
        const sourceCenter = this.getTokenCenter(sourceToken);
        const targetCenter = this.getTokenCenter(targetToken);
        
        // Calculate direction vector
        const dx = targetCenter.x - sourceCenter.x;
        const dy = targetCenter.y - sourceCenter.y;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate desired distance in pixels
        const gridSize = canvas.grid.size;
        const sceneDistance = canvas.scene.grid.distance;
        const desiredDistance = (nextCategory.max * gridSize) / sceneDistance;
        
        // Calculate new position
        const moveRatio = (currentDistance - desiredDistance) / currentDistance;
        const newX = sourceCenter.x + (dx * moveRatio);
        const newY = sourceCenter.y + (dy * moveRatio);
        
        // Convert back to token coordinates
        const tokenSize = sourceToken.document.width * gridSize;
        return {
            x: newX - tokenSize / 2,
            y: newY - tokenSize / 2
        };
    }
    
    /**
     * Calculate optimal position to retreat from a target token
     */
    calculateRetreatPosition(sourceToken, targetToken) {
        const relationship = this.getRelationship(sourceToken, targetToken);
        if (!relationship) return null;
        
        const nextCategory = this.getRetreatCategory(relationship.category);
        if (nextCategory.key === relationship.category.key) return null; // Already at farthest
        
        const sourceCenter = this.getTokenCenter(sourceToken);
        const targetCenter = this.getTokenCenter(targetToken);
        
        // Calculate direction vector (opposite for retreat)
        const dx = sourceCenter.x - targetCenter.x;
        const dy = sourceCenter.y - targetCenter.y;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate desired distance in pixels
        const gridSize = canvas.grid.size;
        const sceneDistance = canvas.scene.grid.distance;
        const desiredDistance = (nextCategory.min * gridSize) / sceneDistance;
        
        // Calculate new position
        const moveRatio = desiredDistance / currentDistance;
        const newX = targetCenter.x + (dx * moveRatio);
        const newY = targetCenter.y + (dy * moveRatio);
        
        // Convert back to token coordinates
        const tokenSize = sourceToken.document.width * gridSize;
        return {
            x: newX - tokenSize / 2,
            y: newY - tokenSize / 2
        };
    }
    
    getTokenCenter(token) {
        const x = token.x + (token.document.width * canvas.grid.size) / 2;
        const y = token.y + (token.document.height * canvas.grid.size) / 2;
        return { x, y };
    }
    
    clear() {
        this.stateMatrix.clear();
        this.previousStates.clear();
    }
}