# Relational Movement - FoundryVTT Module

A combat overlay that displays movement categories between tokens based on relative distances, abstracting movement into categorical chunks (Near, Close, Far, Distant, Remote) rather than exact measurements.

## Installation & Testing

### Prerequisites
- FoundryVTT v11 or higher
- A world with tokens placed on scenes

### Installation Steps

1. **Copy module to FoundryVTT:**
   ```bash
   # Linux/Mac
   cp -r /Users/caboose/relationalmovement /path/to/foundry/Data/modules/relational-movement
   
   # Windows
   xcopy "C:\path\to\relationalmovement" "C:\path\to\foundry\Data\modules\relational-movement" /E /I
   ```

2. **Enable the module:**
   - Launch FoundryVTT
   - Open/create a world
   - Go to "Game Settings" → "Manage Modules"
   - Find "Relational Movement" and check the box to enable it
   - Click "Save Module Settings"
   - Restart the world

### Testing the Module

#### Basic Functionality Test
1. **Setup:**
   - Open a scene with a grid
   - Place 3-5 tokens on the scene at various distances

2. **Activate module:**
   - Press `Shift+M` to toggle the module on
   - You should see a notification: "Relational Movement enabled"

3. **Test distance rings:**
   - Click on a token to select it
   - Colored rings should appear around other tokens:
     - **Red**: Near (0-1m)
     - **Orange**: Close (1-10m) 
     - **Yellow**: Far (10-25m)
     - **Light Green**: Distant (25-100m)
     - **Green**: Remote (100m+)
   - Selected token should have a white indicator ring

4. **Test real-time updates:**
   - Drag the selected token around
   - Ring colors should update automatically as distances change

5. **Test cleanup:**
   - Press `Shift+M` again to disable
   - All rings should disappear
   - Notification: "Relational Movement disabled"

#### Advanced Testing
- **Multiple tokens**: Test with 10+ tokens for performance
- **Scene switching**: Change scenes and verify cleanup
- **Token deletion**: Delete tokens and check for errors
- **Settings**: Open module settings and adjust opacity

### Expected Behavior

**✅ Working correctly if:**
- Rings appear when token is selected and module is active
- Colors match distance categories correctly
- Rings update smoothly when tokens move
- No console errors in browser dev tools
- Performance remains smooth with multiple tokens

**❌ Issues to report:**
- Console errors in browser dev tools (F12)
- Rings don't appear or have wrong colors
- Performance lag with many tokens
- Module doesn't toggle on/off properly

### Troubleshooting

**Module won't enable:**
- Check browser console for errors
- Verify file permissions in modules directory
- Ensure FoundryVTT version compatibility

**Rings don't appear:**
- Check that tokens are placed on the scene
- Verify a token is selected (controlled)
- Press F12 and check console for JavaScript errors

**Performance issues:**
- Reduce number of tokens on scene
- Check module settings for token limits

### Development Status

This is a Phase 1 MVP implementation with:
- ✅ Basic ring rendering
- ✅ Distance calculations  
- ✅ Real-time updates
- ✅ Toggle functionality
- ⚠️  Limited to 50 tokens (performance)
- ⚠️  Ring-only display (no line tracing yet)

### File Structure
```
relational-movement/
├── module.json           # Module manifest
├── scripts/
│   ├── main.js          # Core module logic
│   ├── settings.js      # Configuration
│   ├── distance-calc.js # Distance calculations
│   └── renderer.js      # Canvas rendering
├── styles/
│   └── module.css       # Visual styling
└── lang/
    └── en.json          # Localization
```