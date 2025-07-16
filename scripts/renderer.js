import { DistanceCalculator } from './distance-calc.js';
import { RelationshipTable } from './table-ui.js';

export class RingRenderer {
    static MODULE_ID = 'relational-movement';
    
    constructor() {
        this.renderedRings = [];
        this.renderedLines = [];
        this.renderedLabels = [];
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
        console.log(`Relational Movement | drawCategoryRing called for ${token?.name} with category ${category?.key}`);
        
        if (!this.containerLayer || !token || !category) {
            console.error(`Relational Movement | Missing requirements - containerLayer: ${!!this.containerLayer}, token: ${!!token}, category: ${!!category}`);
            return null;
        }
        
        const graphics = new PIXI.Graphics();
        
        const tokenCenter = this.getTokenCenter(token);
        if (!tokenCenter) {
            console.error(`Relational Movement | Could not get token center for ${token.name}`);
            return null;
        }
        
        const radius = this.calculateRingRadius(category);
        const color = this.hexToNumber(category.color);
        
        console.log(`Relational Movement | Drawing ring - center: (${tokenCenter.x}, ${tokenCenter.y}), radius: ${radius}, color: ${category.color} (${color}), opacity: ${opacity}`);
        
        graphics.lineStyle(3, color, opacity);
        graphics.drawCircle(tokenCenter.x, tokenCenter.y, radius);
        
        graphics.name = `ring-${token.id}-${category.key}`;
        graphics.interactive = false;
        graphics.interactiveChildren = false;
        
        this.containerLayer.addChild(graphics);
        this.renderedRings.push(graphics);
        
        console.log(`Relational Movement | Ring added to container layer. Total rings: ${this.renderedRings.length}`);
        
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
        
        // Add distance label if enabled
        const showLabels = game.settings.get(RingRenderer.MODULE_ID, 'showDistanceLabels');
        if (showLabels) {
            // Calculate the actual distance for the label
            const distance = DistanceCalculator.calculateDistance(fromToken, toToken);
            const label = this.drawDistanceLabel(fromToken, toToken, category, distance);
            if (label) {
                this.renderedLabels.push(label);
            }
        }
        
        return graphics;
    }
    
    drawDistanceLabel(fromToken, toToken, category, actualDistance) {
        if (!this.containerLayer || !fromToken || !toToken) {
            return null;
        }
        
        const fromCenter = this.getTokenCenter(fromToken);
        const toCenter = this.getTokenCenter(toToken);
        
        if (!fromCenter || !toCenter) return null;
        
        // Calculate midpoint
        const midX = (fromCenter.x + toCenter.x) / 2;
        const midY = (fromCenter.y + toCenter.y) / 2;
        
        // Get distance text based on mode
        const distanceMode = game.settings.get(RingRenderer.MODULE_ID, 'distanceMode');
        let labelText;
        
        if (distanceMode === 'abstracted') {
            labelText = category.key;
        } else {
            // Use the passed actual distance
            labelText = `${Math.round(actualDistance)}${canvas.scene.grid.units || 'u'}`;
        }
        
        // Create text object
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            stroke: 0x000000,
            strokeThickness: 3,
            align: 'center',
            fontWeight: 'bold'
        });
        
        const text = new PIXI.Text(labelText, textStyle);
        text.anchor.set(0.5, 0.5);
        text.position.set(midX, midY);
        
        text.name = `label-${fromToken.id}-${toToken.id}`;
        text.interactive = false;
        text.interactiveChildren = false;
        
        this.containerLayer.addChild(text);
        
        return text;
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
        
        // Use token.x and token.y which are updated immediately, 
        // rather than token.document.x/y which may be stale during updates
        const x = token.x + (token.document.width * canvas.grid.size) / 2;
        const y = token.y + (token.document.height * canvas.grid.size) / 2;
        
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
        this.clearAllLabels();
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
    
    clearAllLabels() {
        this.renderedLabels.forEach(label => {
            if (label.parent) {
                label.parent.removeChild(label);
            }
            label.destroy();
        });
        this.renderedLabels = [];
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
        console.log(`Relational Movement | renderTokenRelationships called for: ${referenceToken?.name || 'null'}`);
        
        if (!referenceToken || !this.containerLayer) {
            console.error(`Relational Movement | Missing referenceToken (${!!referenceToken}) or containerLayer (${!!this.containerLayer})`);
            return;
        }
        
        console.log(`Relational Movement | Clearing existing rings/lines...`);
        this.clearAllRings();
        
        const relationships = DistanceCalculator.getTokenRelationships(referenceToken);
        const opacity = game.settings.get(RingRenderer.MODULE_ID, 'opacity') / 100;
        const showRings = game.settings.get(RingRenderer.MODULE_ID, 'showRings');
        const showLines = game.settings.get(RingRenderer.MODULE_ID, 'showLines');
        
        console.log(`Relational Movement | Settings - showRings: ${showRings}, showLines: ${showLines}, opacity: ${opacity}`);
        console.log(`Relational Movement | Found ${relationships.length} token relationships`);
        
        this.drawSelectedIndicator(referenceToken);
        
        let renderedCount = 0;
        
        relationships.forEach((relationship, index) => {
            console.log(`Relational Movement | Processing relationship ${index + 1}: ${relationship.token.name} - ${relationship.category.key}`);
            
            if (showRings) {
                const ring = this.drawCategoryRing(relationship.token, relationship.category, opacity);
                if (ring) {
                    console.log(`Relational Movement | Successfully drew ring for ${relationship.token.name}`);
                    renderedCount++;
                } else {
                    console.error(`Relational Movement | Failed to draw ring for ${relationship.token.name}`);
                }
            }
            
            if (showLines) {
                const line = this.drawLineBetweenTokens(referenceToken, relationship.token, relationship.category, opacity);
                if (line) {
                    console.log(`Relational Movement | Successfully drew line for ${relationship.token.name}`);
                    renderedCount++;
                } else {
                    console.error(`Relational Movement | Failed to draw line for ${relationship.token.name}`);
                }
            }
        });
        
        // Update table separately if it's currently visible
        this.updateTableIfVisible(referenceToken, relationships);
        
        const visualElements = [];
        if (showRings) visualElements.push('rings');
        if (showLines) visualElements.push('lines');
        
        console.log(`Relational Movement | Render complete - ${visualElements.join(' and ')} for ${relationships.length} tokens: ${referenceToken.name}, total rendered: ${renderedCount}`);
        console.log(`Relational Movement | Container layer children count: ${this.containerLayer.children.length}`);
    }
    
    updateTableIfVisible(referenceToken, relationships) {
        // Only update table if it's currently visible AND it's for the same reference token
        // This prevents the table from changing when selecting different tokens
        if (this.relationshipTable && this.relationshipTable.isVisible) {
            // Only update if this is the same token the table is currently showing
            // or if explicitly requested (e.g., when tokens move)
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