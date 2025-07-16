import { DistanceCalculator } from './distance-calc.js';
import { RelationshipTable } from './table-ui.js';

export class RingRenderer {
    static MODULE_ID = 'relational-movement';
    
    constructor() {
        this.renderedRings = [];
        this.renderedLines = [];
        this.selectedIndicator = null;
        this.containerLayer = null;
        this.relationshipTable = new RelationshipTable();
    }
    
    initialize() {
        this.createContainerLayer();
    }
    
    createContainerLayer() {
        if (!canvas.interface) {
            console.warn('Relational Movement | Canvas interface not ready');
            return;
        }
        
        if (this.containerLayer) {
            this.containerLayer.destroy();
        }
        
        this.containerLayer = new PIXI.Container();
        this.containerLayer.name = 'relational-movement-layer';
        this.containerLayer.zIndex = 100;
        
        canvas.interface.addChild(this.containerLayer);
        canvas.interface.sortChildren();
    }
    
    drawCategoryRing(token, category, opacity = 0.5) {
        if (!this.containerLayer || !token || !category) {
            return null;
        }
        
        const graphics = new PIXI.Graphics();
        
        const tokenCenter = this.getTokenCenter(token);
        if (!tokenCenter) return null;
        
        const radius = this.calculateRingRadius(category);
        const color = this.hexToNumber(category.color);
        
        graphics.lineStyle(3, color, opacity);
        graphics.drawCircle(tokenCenter.x, tokenCenter.y, radius);
        
        graphics.name = `ring-${token.id}-${category.key}`;
        graphics.interactive = false;
        graphics.interactiveChildren = false;
        
        this.containerLayer.addChild(graphics);
        this.renderedRings.push(graphics);
        
        return graphics;
    }
    
    drawLineBetweenTokens(fromToken, toToken, category, opacity = 0.5) {
        if (!this.containerLayer || !fromToken || !toToken || !category) {
            return null;
        }
        
        const graphics = new PIXI.Graphics();
        
        const fromCenter = this.getTokenCenter(fromToken);
        const toCenter = this.getTokenCenter(toToken);
        
        if (!fromCenter || !toCenter) return null;
        
        const color = this.hexToNumber(category.color);
        const lineWidth = 4;
        
        graphics.lineStyle(lineWidth, color, opacity);
        graphics.moveTo(fromCenter.x, fromCenter.y);
        graphics.lineTo(toCenter.x, toCenter.y);
        
        graphics.name = `line-${fromToken.id}-${toToken.id}-${category.key}`;
        graphics.interactive = false;
        graphics.interactiveChildren = false;
        
        this.containerLayer.addChild(graphics);
        this.renderedLines.push(graphics);
        
        return graphics;
    }
    
    drawSelectedIndicator(token) {
        if (!this.containerLayer || !token) {
            return null;
        }
        
        this.clearSelectedIndicator();
        
        const graphics = new PIXI.Graphics();
        const tokenCenter = this.getTokenCenter(token);
        
        if (!tokenCenter) return null;
        
        const tokenSize = Math.max(token.document.width, token.document.height) * canvas.grid.size;
        const radius = (tokenSize / 2) + 10;
        
        graphics.lineStyle(4, 0xFFFFFF, 0.8);
        graphics.drawCircle(tokenCenter.x, tokenCenter.y, radius);
        
        graphics.name = `selected-indicator-${token.id}`;
        graphics.interactive = false;
        graphics.interactiveChildren = false;
        
        this.containerLayer.addChild(graphics);
        this.selectedIndicator = graphics;
        
        return graphics;
    }
    
    getTokenCenter(token) {
        if (!token || !token.document) {
            return null;
        }
        
        const x = token.document.x + (token.document.width * canvas.grid.size) / 2;
        const y = token.document.y + (token.document.height * canvas.grid.size) / 2;
        
        return { x, y };
    }
    
    calculateRingRadius(category) {
        const gridSize = canvas.grid.size;
        const sceneDistance = canvas.scene.grid.distance;
        
        let baseRadius;
        switch (category.key) {
            case 'NEAR':
                baseRadius = (category.max * gridSize) / sceneDistance;
                break;
            case 'CLOSE':
                baseRadius = (category.max * gridSize) / sceneDistance;
                break;
            case 'FAR':
                baseRadius = (category.max * gridSize) / sceneDistance;
                break;
            case 'DISTANT':
                baseRadius = (category.max * gridSize) / sceneDistance;
                break;
            case 'REMOTE':
                baseRadius = (100 * gridSize) / sceneDistance;
                break;
            default:
                baseRadius = (10 * gridSize) / sceneDistance;
        }
        
        return Math.max(baseRadius, 20);
    }
    
    hexToNumber(hex) {
        return parseInt(hex.replace('#', ''), 16);
    }
    
    clearAllRings() {
        this.renderedRings.forEach(ring => {
            if (ring.parent) {
                ring.parent.removeChild(ring);
            }
            ring.destroy();
        });
        this.renderedRings = [];
        
        this.clearAllLines();
        this.clearSelectedIndicator();
        
        // Note: Table is NOT cleared here - it has independent lifecycle
    }
    
    clearAllLines() {
        this.renderedLines.forEach(line => {
            if (line.parent) {
                line.parent.removeChild(line);
            }
            line.destroy();
        });
        this.renderedLines = [];
    }
    
    clearSelectedIndicator() {
        if (this.selectedIndicator) {
            if (this.selectedIndicator.parent) {
                this.selectedIndicator.parent.removeChild(this.selectedIndicator);
            }
            this.selectedIndicator.destroy();
            this.selectedIndicator = null;
        }
    }
    
    renderTokenRelationships(referenceToken) {
        if (!referenceToken || !this.containerLayer) {
            return;
        }
        
        this.clearAllRings();
        
        const relationships = DistanceCalculator.getTokenRelationships(referenceToken);
        const opacity = game.settings.get(RingRenderer.MODULE_ID, 'opacity') / 100;
        const showRings = game.settings.get(RingRenderer.MODULE_ID, 'showRings');
        const showLines = game.settings.get(RingRenderer.MODULE_ID, 'showLines');
        
        this.drawSelectedIndicator(referenceToken);
        
        let renderedCount = 0;
        
        relationships.forEach(relationship => {
            if (showRings) {
                this.drawCategoryRing(relationship.token, relationship.category, opacity);
                renderedCount++;
            }
            if (showLines) {
                this.drawLineBetweenTokens(referenceToken, relationship.token, relationship.category, opacity);
                renderedCount++;
            }
        });
        
        // Update table separately if it's currently visible
        this.updateTableIfVisible(referenceToken, relationships);
        
        const visualElements = [];
        if (showRings) visualElements.push('rings');
        if (showLines) visualElements.push('lines');
        
        console.log(`Relational Movement | Rendered ${visualElements.join(' and ')} for ${relationships.length} tokens: ${referenceToken.name}`);
    }
    
    updateTableIfVisible(referenceToken, relationships) {
        // Only update table if it's currently visible, don't show/hide based on setting here
        if (this.relationshipTable && this.relationshipTable.isVisible) {
            this.relationshipTable.updateTable(referenceToken, relationships);
        }
    }
    
    // Separate method to handle table display based on settings
    handleTableDisplay(referenceToken) {
        if (!referenceToken) {
            this.relationshipTable.hideTable();
            return;
        }
        
        const showTable = game.settings.get(RingRenderer.MODULE_ID, 'showTable');
        const relationships = DistanceCalculator.getTokenRelationships(referenceToken);
        
        if (showTable) {
            this.relationshipTable.showTable(referenceToken, relationships);
        } else {
            this.relationshipTable.hideTable();
        }
    }
    
    destroy() {
        this.clearAllRings();
        
        // Destroy table UI
        if (this.relationshipTable) {
            this.relationshipTable.destroy();
            this.relationshipTable = null;
        }
        
        if (this.containerLayer) {
            if (this.containerLayer.parent) {
                this.containerLayer.parent.removeChild(this.containerLayer);
            }
            this.containerLayer.destroy();
            this.containerLayer = null;
        }
    }
    
    refresh() {
        if (this.containerLayer && this.containerLayer.parent) {
            this.containerLayer.parent.sortChildren();
        }
    }
}