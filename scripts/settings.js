export class RelationalMovementSettings {
    static MODULE_ID = 'relational-movement';
    
    static registerSettings() {
        game.settings.register(this.MODULE_ID, 'enabled', {
            name: 'Enable Relational Movement',
            hint: 'Toggle the relational movement overlay on or off',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false,
            onChange: (value) => {
                if (window.RelationalMovement) {
                    window.RelationalMovement.isActive = value;
                    if (!value) {
                        window.RelationalMovement.clearDisplay();
                        window.RelationalMovement.selectedToken = null;
                    }
                }
            }
        });
        
        game.settings.register(this.MODULE_ID, 'showRings', {
            name: 'Show Rings',
            hint: 'Display colored rings around tokens to show distance categories',
            scope: 'client',
            config: true,
            type: Boolean,
            default: true
        });
        
        game.settings.register(this.MODULE_ID, 'showLines', {
            name: 'Show Lines',
            hint: 'Display colored lines between selected token and other tokens',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false
        });
        
        game.settings.register(this.MODULE_ID, 'showTable', {
            name: 'Show Distance Table',
            hint: 'Display a popup table showing all token distances and categories',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false
        });
        
        game.settings.register(this.MODULE_ID, 'opacity', {
            name: 'Ring/Line Opacity',
            hint: 'Transparency of the distance category rings or lines (0-100%)',
            scope: 'client',
            config: true,
            type: Number,
            range: {
                min: 0,
                max: 100,
                step: 5
            },
            default: 50
        });
        
        game.settings.register(this.MODULE_ID, 'maxTokens', {
            name: 'Maximum Tokens',
            hint: 'Maximum number of tokens to process for performance (MVP limit: 50)',
            scope: 'world',
            config: true,
            type: Number,
            range: {
                min: 10,
                max: 50,
                step: 5
            },
            default: 50
        });
        
        game.settings.register(this.MODULE_ID, 'distanceMode', {
            name: 'Distance Mode',
            hint: 'Choose between abstracted distance categories or actual in-game measurements',
            scope: 'world',
            config: true,
            type: String,
            choices: {
                'abstracted': 'Abstracted (Near/Close/Far/Distant/Remote)',
                'precise': 'Precise (Show actual game distances)'
            },
            default: 'abstracted'
        });
        
        game.settings.register(this.MODULE_ID, 'showDistanceLabels', {
            name: 'Show Distance Labels',
            hint: 'Display distance labels on the center of lines between tokens',
            scope: 'client',
            config: true,
            type: Boolean,
            default: true
        });
        
        game.settings.register(this.MODULE_ID, 'showStateNotifications', {
            name: 'Show State Change Notifications',
            hint: 'Display notifications when tokens move between distance categories',
            scope: 'client',
            config: true,
            type: Boolean,
            default: false
        });
    }
    
    static getSetting(key) {
        return game.settings.get(this.MODULE_ID, key);
    }
    
    static setSetting(key, value) {
        return game.settings.set(this.MODULE_ID, key, value);
    }
}