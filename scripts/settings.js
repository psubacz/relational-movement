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
        
        game.settings.register(this.MODULE_ID, 'visualMode', {
            name: 'Visual Mode',
            hint: 'Choose between rings around tokens or lines between tokens',
            scope: 'client',
            config: true,
            type: String,
            choices: {
                'rings': 'Rings around tokens',
                'lines': 'Lines between tokens'
            },
            default: 'rings'
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
    }
    
    static getSetting(key) {
        return game.settings.get(this.MODULE_ID, key);
    }
    
    static setSetting(key, value) {
        return game.settings.set(this.MODULE_ID, key, value);
    }
}