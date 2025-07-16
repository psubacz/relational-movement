import { TokenStateMatrix } from './state-matrix.js';

export class RelationalContextMenu {
    static MODULE_ID = 'relational-movement';
    
    constructor(stateMatrix) {
        this.stateMatrix = stateMatrix;
        this.setupContextMenuHook();
    }
    
    setupContextMenuHook() {
        // Hook into FoundryVTT's context menu system
        Hooks.on('getTokenHUDButtons', (app, buttons, token) => {
            // Skip if module not active
            if (!CONFIG.relationalMovement?.isActive()) return;
            
            // Only add buttons if we have a selected token and this isn't the selected token
            const selectedTokens = canvas.tokens.controlled;
            if (selectedTokens.length === 0 || selectedTokens.includes(token)) return;
            
            const selectedToken = selectedTokens[0];
            const relationship = this.stateMatrix.getRelationship(selectedToken, token);
            
            if (relationship) {
                // Add advance button
                buttons.unshift({
                    label: `Advance (${relationship.category.key})`,
                    class: 'relational-advance',
                    icon: 'fas fa-arrow-up',
                    onclick: () => this.advanceTowards(selectedToken, token)
                });
                
                // Add retreat button
                buttons.unshift({
                    label: `Retreat (${relationship.category.key})`,
                    class: 'relational-retreat', 
                    icon: 'fas fa-arrow-down',
                    onclick: () => this.retreatFrom(selectedToken, token)
                });
            }
        });
        
        // Use a more direct approach for right-click context menu
        this.setupDirectContextMenu();
    }
    
    setupDirectContextMenu() {
        // Create hotbar macros for advance/retreat functionality
        this.createRelationalMacros();
        
        // For now, let's add keyboard shortcuts as an alternative
        this.setupKeyboardShortcuts();
    }
    
    createRelationalMacros() {
        // Create macros that can be dragged to hotbar
        console.log('Relational Movement | Creating advance/retreat macros');
        
        // Make functions globally available for macros
        window.relationalAdvance = () => {
            const selectedTokens = canvas.tokens.controlled;
            const targetTokens = canvas.tokens.targeted;
            
            if (selectedTokens.length === 0) {
                ui.notifications.warn("Select a token first");
                return;
            }
            
            if (targetTokens.size === 0) {
                ui.notifications.warn("Target a token to advance towards");
                return;
            }
            
            const selectedToken = selectedTokens[0];
            const targetToken = Array.from(targetTokens)[0];
            
            const contextMenu = new RelationalContextMenu(window.relationalMovement.stateMatrix);
            contextMenu.advanceTowards(selectedToken, targetToken);
        };
        
        window.relationalRetreat = () => {
            const selectedTokens = canvas.tokens.controlled;
            const targetTokens = canvas.tokens.targeted;
            
            if (selectedTokens.length === 0) {
                ui.notifications.warn("Select a token first");
                return;
            }
            
            if (targetTokens.size === 0) {
                ui.notifications.warn("Target a token to retreat from");
                return;
            }
            
            const selectedToken = selectedTokens[0];
            const targetToken = Array.from(targetTokens)[0];
            
            const contextMenu = new RelationalContextMenu(window.relationalMovement.stateMatrix);
            contextMenu.retreatFrom(selectedToken, targetToken);
        };
    }
    
    setupKeyboardShortcuts() {
        // Keyboard shortcuts will be registered in main.js init hook
        console.log('Relational Movement | Keyboard shortcuts will be available after restart');
    }
    
    setupRightClickMenu() {
        // Store reference to original _onClickLeft for cleanup
        const originalOnClickRight = Token.prototype._onClickRight;
        
        Token.prototype._onClickRight = function(event) {
            // Call original handler first
            const result = originalOnClickRight.call(this, event);
            
            // Add our custom menu items
            const menu = this._createContextMenu();
            if (menu) {
                const selectedTokens = canvas.tokens.controlled;
                if (selectedTokens.length > 0 && !selectedTokens.includes(this)) {
                    RelationalContextMenu.addMenuItems(menu, selectedTokens[0], this);
                }
            }
            
            return result;
        };
    }
    
    static addMenuItems(menu, selectedToken, targetToken) {
        if (!window.relationalMovement?.stateMatrix) return;
        
        const stateMatrix = window.relationalMovement.stateMatrix;
        const relationship = stateMatrix.getRelationship(selectedToken, targetToken);
        
        if (!relationship) return;
        
        // Add separator
        menu.push({ label: "───────────", disabled: true });
        
        // Add advance option
        const advanceCategory = stateMatrix.getAdvanceCategory(relationship.category);
        const canAdvance = advanceCategory.key !== relationship.category.key;
        
        menu.push({
            label: `🔼 Advance to ${targetToken.name}`,
            icon: "fas fa-arrow-up",
            condition: canAdvance,
            callback: () => {
                const contextMenu = new RelationalContextMenu(stateMatrix);
                contextMenu.advanceTowards(selectedToken, targetToken);
            }
        });
        
        // Add retreat option
        const retreatCategory = stateMatrix.getRetreatCategory(relationship.category);
        const canRetreat = retreatCategory.key !== relationship.category.key;
        
        menu.push({
            label: `🔽 Retreat from ${targetToken.name}`,
            icon: "fas fa-arrow-down", 
            condition: canRetreat,
            callback: () => {
                const contextMenu = new RelationalContextMenu(stateMatrix);
                contextMenu.retreatFrom(selectedToken, targetToken);
            }
        });
        
        // Add current relationship info
        menu.push({
            label: `📏 Currently ${relationship.category.key} (${Math.round(relationship.distance)}${canvas.scene.grid.units})`,
            icon: "fas fa-info-circle",
            condition: true,
            disabled: true
        });
    }
    
    async advanceTowards(sourceToken, targetToken) {
        const newPosition = this.stateMatrix.calculateAdvancePosition(sourceToken, targetToken);
        
        if (!newPosition) {
            ui.notifications.warn(`${sourceToken.name} is already at the closest position to ${targetToken.name}`);
            return;
        }
        
        // Check if user can control this token
        if (!sourceToken.isOwner && !game.user.isGM) {
            ui.notifications.error("You don't have permission to move this token");
            return;
        }
        
        // Animate the movement
        try {
            await sourceToken.document.update({
                x: newPosition.x,
                y: newPosition.y
            }, { animate: true });
            
            // Update state matrix after movement
            setTimeout(() => {
                this.stateMatrix.updateMatrix();
            }, 100);
            
            ui.notifications.info(`${sourceToken.name} advanced towards ${targetToken.name}`);
        } catch (error) {
            console.error('Relational Movement | Error moving token:', error);
            ui.notifications.error('Failed to move token');
        }
    }
    
    async retreatFrom(sourceToken, targetToken) {
        const newPosition = this.stateMatrix.calculateRetreatPosition(sourceToken, targetToken);
        
        if (!newPosition) {
            ui.notifications.warn(`${sourceToken.name} is already at the farthest position from ${targetToken.name}`);
            return;
        }
        
        // Check if user can control this token
        if (!sourceToken.isOwner && !game.user.isGM) {
            ui.notifications.error("You don't have permission to move this token");
            return;
        }
        
        // Animate the movement
        try {
            await sourceToken.document.update({
                x: newPosition.x,
                y: newPosition.y
            }, { animate: true });
            
            // Update state matrix after movement
            setTimeout(() => {
                this.stateMatrix.updateMatrix();
            }, 100);
            
            ui.notifications.info(`${sourceToken.name} retreated from ${targetToken.name}`);
        } catch (error) {
            console.error('Relational Movement | Error moving token:', error);
            ui.notifications.error('Failed to move token');
        }
    }
}