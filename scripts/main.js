import { RingRenderer } from './renderer.js';
import { RelationalMovementSettings } from './settings.js';

export const MODULE_ID = 'relational-movement';
export const MODULE_TITLE = 'Relational Movement';

// Module state
let isActive = false;
let selectedToken = null;
let renderer = null;

console.log('Relational Movement | Script loaded');

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
    if (!isActive || !selectedToken) return;
    
    if (change.x !== undefined || change.y !== undefined) {
        console.log(`${MODULE_TITLE} | Token moved, updating display`);
        updateDisplay();
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
    updateToolbarButton();
}

function createToolbarButton() {
    const controls = ui.controls.controls.find(c => c.name === "token");
    if (!controls) return;
    
    controls.tools.push({
        name: "relational-movement-toggle",
        title: "Toggle Relational Movement",
        icon: "fas fa-arrows-alt",
        onClick: () => toggle(),
        toggle: true,
        active: isActive
    });
    
    ui.controls.render();
}

function updateToolbarButton() {
    const button = ui.controls.controls
        .find(c => c.name === "token")?.tools
        .find(t => t.name === "relational-movement-toggle");
    
    if (button) {
        button.active = isActive;
        ui.controls.render();
    }
}

function updateDisplay() {
    if (!selectedToken || !isActive) {
        clearDisplay();
        return;
    }
    
    if (renderer) {
        renderer.renderTokenRelationships(selectedToken);
    }
}

function clearDisplay() {
    if (renderer) {
        renderer.clearAllRings();
    }
}

// Hook registration following combat-tracker-dock pattern
Hooks.once('init', () => {
    console.log(`${MODULE_TITLE} | Initializing module`);
    RelationalMovementSettings.registerSettings();
    
    // Set up CONFIG object for other modules to access
    CONFIG.relationalMovement = {
        MODULE_ID,
        MODULE_TITLE,
        toggle,
        isActive: () => isActive,
        selectedToken: () => selectedToken
    };
    
    // Register hooks
    Hooks.on('controlToken', onTokenControl);
    Hooks.on('updateToken', onTokenUpdate);
    Hooks.on('deleteToken', onTokenDelete);
    Hooks.on('canvasReady', onCanvasReady);
});

Hooks.once('ready', () => {
    console.log(`${MODULE_TITLE} | Module ready`);
    
    // Initialize renderer
    renderer = new RingRenderer();
    renderer.initialize();
    createToolbarButton();
    
    // Register keybinding
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
    
    // Global debugging functions
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
        console.log('================================');
    };
    
    console.log('Relational Movement | Available commands:');
    console.log('- Shift+M (keybinding)');
    console.log('- Click toolbar button (token controls)');
    console.log('- toggleRelationalMovement() (console command)');
});