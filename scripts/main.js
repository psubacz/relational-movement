import { RingRenderer } from './renderer.js';
import { RelationalMovementSettings } from './settings.js';
import { DistanceCalculator } from './distance-calc.js';
import { TokenStateMatrix } from './state-matrix.js';
import { RelationalContextMenu } from './context-menu.js';

export const MODULE_ID = 'relational-movement';
export const MODULE_TITLE = 'Relational Movement';

// Module state
let isActive = false;
let selectedToken = null;
let renderer = null;
let stateMatrix = null;
let contextMenu = null;

console.log('Relational Movement | Script loaded');

// Create functions immediately for debugging
window.toggleRelationalMovement = () => {
    console.log('Toggle called, but module may not be ready yet');
    if (typeof toggle === 'function') {
        toggle();
    } else {
        console.error('Module not ready - toggle function not available');
    }
};

// Simple toggle without toolbar button errors
window.simpleToggle = () => {
    console.log(`${MODULE_TITLE} | Simple toggle called, current state:`, isActive);
    isActive = !isActive;
    console.log(`${MODULE_TITLE} | Module ${isActive ? 'activated' : 'deactivated'}`);
    
    if (!isActive) {
        clearDisplay();
        selectedToken = null;
    } else if (selectedToken) {
        updateDisplay();
    }
    
    ui.notifications.info(`Relational Movement ${isActive ? 'enabled' : 'disabled'}`);
    console.log(`${MODULE_TITLE} | Simple toggle completed, new state:`, isActive);
};

window.debugRelationalMovement = () => {
    console.log('=== Relational Movement Debug (Early) ===');
    console.log('Script loaded:', true);
    console.log('Canvas ready:', !!canvas);
    console.log('Game ready:', !!game);
    console.log('Module state variables exist:', typeof isActive !== 'undefined');
    console.log('Toggle function exists:', typeof toggle === 'function');
    console.log('================================');
};

// Event handlers
function onTokenControl(token, controlled) {
    if (!isActive) return;
    
    if (controlled) {
        console.log(`${MODULE_TITLE} | Token selected:`, token.name);
        selectedToken = token;
        updateDisplay();
    } else {
        selectedToken = null;
        clearDisplay();
    }
}

function onTokenUpdate(document, change, options, userId) {
    console.log(`${MODULE_TITLE} | onTokenUpdate called - Active: ${isActive}, Selected: ${selectedToken?.name || 'none'}, Document: ${document.name}`);
    
    if (!isActive) {
        console.log(`${MODULE_TITLE} | Skipping update - module inactive`);
        return;
    }
    
    if (change.x !== undefined || change.y !== undefined) {
        console.log(`${MODULE_TITLE} | Position change detected for ${document.name} - x: ${change.x}, y: ${change.y}`);
        
        // Update display if we have a selected token (any token movement affects distance calculations)
        // Update state matrix first
        if (stateMatrix) {
            stateMatrix.updateMatrix();
        }
        
        if (selectedToken) {
            // Refresh selectedToken reference in case it's stale
            const currentSelected = canvas.tokens.controlled[0];
            if (currentSelected) {
                selectedToken = currentSelected;
                // Use setTimeout to ensure token visual positions are updated before re-rendering
                setTimeout(() => {
                    updateDisplay();
                }, 50);
            } else {
                console.log(`${MODULE_TITLE} | No currently controlled token found`);
            }
        } else {
            console.log(`${MODULE_TITLE} | No selected token to update display for`);
        }
    } else {
        console.log(`${MODULE_TITLE} | Non-position update for ${document.name}:`, change);
    }
}

function onTokenDelete(document, options, userId) {
    if (!isActive) return;
    
    if (selectedToken && selectedToken.id === document.id) {
        selectedToken = null;
        clearDisplay();
    } else {
        updateDisplay();
    }
}

function onCanvasReady() {
    console.log(`${MODULE_TITLE} | Canvas ready, reinitializing renderer`);
    if (renderer) {
        renderer.initialize();
    }
    selectedToken = null;
}

// Core functions
function toggle() {
    console.log(`${MODULE_TITLE} | Toggle called, current state:`, isActive);
    isActive = !isActive;
    console.log(`${MODULE_TITLE} | Module ${isActive ? 'activated' : 'deactivated'}`);
    
    if (!isActive) {
        clearDisplay();
        selectedToken = null;
    } else if (selectedToken) {
        updateDisplay();
    }
    
    ui.notifications.info(`Relational Movement ${isActive ? 'enabled' : 'disabled'}`);
    console.log(`${MODULE_TITLE} | Toggle completed, new state:`, isActive);
    
    // Skip toolbar button update for now to avoid errors
    // updateToolbarButton();
}

function createToolbarButton() {
    const controls = ui.controls.controls.find(c => c.name === "token");
    if (!controls) return;
    
    // Check if button already exists to avoid duplicates
    const existingButton = controls.tools.find(t => t.name === "relational-movement-toggle");
    if (existingButton) return;
    
    controls.tools.push({
        name: "relational-movement-toggle",
        title: "Toggle Relational Movement (Shift+M)",
        icon: "fas fa-project-diagram",
        onClick: () => toggle(),
        toggle: true,
        active: isActive,
        visible: true
    });
    
    ui.controls.render();
    console.log(`${MODULE_TITLE} | Toolbar button added to Token Controls`);
}

function updateToolbarButton() {
    // Check if ui.controls exists and has the right structure
    if (!ui.controls || !ui.controls.controls) {
        console.log('UI controls not available yet');
        return;
    }
    
    const controls = ui.controls.controls.find(c => c.name === "token");
    if (!controls) {
        console.log('Token controls not found');
        return;
    }
    
    const button = controls.tools.find(t => t.name === "relational-movement-toggle");
    if (button) {
        button.active = isActive;
        ui.controls.render();
        
        // Add visual feedback to the actual DOM element
        setTimeout(() => {
            const buttonElement = document.querySelector('[data-tool="relational-movement-toggle"]');
            if (buttonElement) {
                buttonElement.classList.toggle('active', isActive);
                buttonElement.style.backgroundColor = isActive ? '#4CAF50' : '';
            }
        }, 50);
        console.log(`${MODULE_TITLE} | Toolbar button updated, active: ${isActive}`);
    } else {
        console.log('Toolbar button not found');
    }
}

function updateDisplay() {
    if (!selectedToken || !isActive) {
        clearDisplay();
        return;
    }
    
    console.log(`${MODULE_TITLE} | updateDisplay called for token: ${selectedToken.name}`);
    
    if (renderer) {
        renderer.renderTokenRelationships(selectedToken);
        // Handle table display - but only show/hide based on settings, don't force redraw on token selection
        const showTable = game.settings.get('relational-movement', 'showTable');
        if (showTable && !renderer.relationshipTable.isVisible) {
            // Only show table if setting is on and table is not already visible
            renderer.handleTableDisplay(selectedToken);
        }
    } else {
        console.error(`${MODULE_TITLE} | Renderer not available in updateDisplay`);
    }
}

function clearDisplay() {
    if (renderer) {
        renderer.clearAllRings();
        // Table is handled separately and will persist unless explicitly hidden
    }
}

// New functions for independent table control
function refreshTable() {
    if (renderer && selectedToken && isActive) {
        renderer.handleTableDisplay(selectedToken);
    }
}

function hideTable() {
    if (renderer && renderer.relationshipTable) {
        renderer.relationshipTable.hideTable();
    }
}

function toggleTable() {
    if (renderer && renderer.relationshipTable) {
        if (selectedToken && isActive) {
            const relationships = DistanceCalculator.getTokenRelationships(selectedToken);
            renderer.relationshipTable.toggle(selectedToken, relationships);
        }
    }
}

// Hook registration following combat-tracker-dock pattern
Hooks.once('init', () => {
    console.log(`${MODULE_TITLE} | Initializing module`);
    RelationalMovementSettings.registerSettings();
    
    // Register keybinding during init hook (required by FoundryVTT)
    console.log(`${MODULE_TITLE} | Registering keybinding...`);
    game.keybindings.register(MODULE_ID, 'toggle', {
        name: 'Toggle Relational Movement',
        hint: 'Toggle the relational movement display on/off',
        editable: [
            {
                key: 'KeyM',
                modifiers: ['Shift']
            }
        ],
        onDown: () => {
            console.log('Relational Movement | Keybinding triggered');
            toggle();
            return true;
        }
    });
    console.log(`${MODULE_TITLE} | Keybinding registered successfully`);
    
    // Register advance/retreat keybindings
    game.keybindings.register(MODULE_ID, 'advance', {
        name: 'Advance towards targeted token',
        hint: 'Move selected token closer to targeted token (Select token, target another, press hotkey)',
        editable: [
            {
                key: 'Equal',
                modifiers: ['Shift']
            }
        ],
        onDown: () => {
            if (window.relationalAdvance) {
                window.relationalAdvance();
            }
            return true;
        }
    });
    
    game.keybindings.register(MODULE_ID, 'retreat', {
        name: 'Retreat from targeted token',
        hint: 'Move selected token away from targeted token (Select token, target another, press hotkey)',
        editable: [
            {
                key: 'Minus',
                modifiers: ['Shift']
            }
        ],
        onDown: () => {
            if (window.relationalRetreat) {
                window.relationalRetreat();
            }
            return true;
        }
    });
    console.log(`${MODULE_TITLE} | Advance/Retreat keybindings registered successfully`);
    
    // Set up CONFIG object for other modules to access
    CONFIG.relationalMovement = {
        MODULE_ID,
        MODULE_TITLE,
        toggle,
        simpleToggle: () => {
            console.log(`${MODULE_TITLE} | Simple toggle called, current state:`, isActive);
            isActive = !isActive;
            console.log(`${MODULE_TITLE} | Module ${isActive ? 'activated' : 'deactivated'}`);
            
            if (!isActive) {
                clearDisplay();
                selectedToken = null;
            } else if (selectedToken) {
                updateDisplay();
            }
            
            ui.notifications.info(`Relational Movement ${isActive ? 'enabled' : 'disabled'}`);
            console.log(`${MODULE_TITLE} | Simple toggle completed, new state:`, isActive);
        },
        isActive: () => isActive,
        selectedToken: () => selectedToken,
        stateMatrix: () => stateMatrix,
        // Independent table controls
        refreshTable,
        hideTable,
        toggleTable
    };
    
    // Make stateMatrix globally available for context menu
    window.relationalMovement = {
        stateMatrix: stateMatrix
    };
    
    // Register hooks
    Hooks.on('controlToken', onTokenControl);
    Hooks.on('updateToken', onTokenUpdate);
    Hooks.on('deleteToken', onTokenDelete);
    Hooks.on('canvasReady', onCanvasReady);
    
    // Additional hook for when token movement animation completes
    Hooks.on('refreshToken', (token) => {
        if (!isActive || !selectedToken) return;
        
        console.log(`${MODULE_TITLE} | refreshToken hook fired for ${token.name}`);
        
        // Update state matrix
        if (stateMatrix) {
            stateMatrix.updateMatrix();
        }
        
        // Update display when any token's visual representation is refreshed
        const currentSelected = canvas.tokens.controlled[0];
        if (currentSelected) {
            selectedToken = currentSelected;
            updateDisplay();
        }
    });
});

Hooks.once('ready', () => {
    try {
        console.log(`${MODULE_TITLE} | Module ready hook started`);
        
        // Initialize renderer
        console.log(`${MODULE_TITLE} | Creating renderer...`);
        renderer = new RingRenderer();
        renderer.initialize();
        console.log(`${MODULE_TITLE} | Renderer created successfully`);
        
        // Initialize state matrix
        console.log(`${MODULE_TITLE} | Creating state matrix...`);
        stateMatrix = new TokenStateMatrix();
        console.log(`${MODULE_TITLE} | State matrix created successfully`);
        
        // Initialize context menu
        console.log(`${MODULE_TITLE} | Creating context menu...`);
        contextMenu = new RelationalContextMenu(stateMatrix);
        console.log(`${MODULE_TITLE} | Context menu created successfully`);
        
        // Skip toolbar button for now to avoid errors
        // console.log(`${MODULE_TITLE} | Creating toolbar button...`);
        // createToolbarButton();
        
        // Global debugging functions
        console.log(`${MODULE_TITLE} | Creating global functions...`);
        window.toggleRelationalMovement = toggle;
        window.debugRelationalMovement = () => {
            console.log('=== Relational Movement Debug ===');
            console.log('Module loaded:', true);
            console.log('Canvas ready:', !!canvas);
            console.log('Game ready:', !!game);
            console.log('UI ready:', !!ui);
            console.log('Module active:', isActive);
            console.log('Selected token:', selectedToken);
            console.log('Renderer:', renderer);
            console.log('Tokens on canvas:', canvas?.tokens?.placeables?.length || 0);
            console.log('User is GM:', game?.user?.isGM);
            console.log('Current scene:', game?.scenes?.viewed?.name);
            console.log('Controls:', ui?.controls?.controls?.find(c => c.name === "token"));
            console.log('================================');
        };
        
        // Force enable for testing
        window.forceEnableRM = () => {
            console.log('Forcing Relational Movement enable...');
            isActive = true;
            updateToolbarButton();
            ui.notifications.info('Relational Movement force enabled');
        };
        
        console.log('Relational Movement | Available commands:');
        console.log('- Shift+M (keybinding)');
        console.log('- Click toolbar button (token controls)');
        console.log('- toggleRelationalMovement() (console command)');
        console.log('- CONFIG.relationalMovement.toggle() (backup method)');
        
        console.log(`${MODULE_TITLE} | Module ready hook completed successfully`);
    } catch (error) {
        console.error(`${MODULE_TITLE} | Error in ready hook:`, error);
    }
});