# Phase 2 - Relational Movement Enhancement

## Overview
Phase 2 builds upon the basic relational movement visualization by adding abstracted distance modes, token state tracking, and interactive movement commands.

## Implemented Features

### 1. Abstracted vs In-Game Distance Setting ✅
- **Setting**: `distanceMode` with options:
  - `abstracted` (default): Shows categorical distances (NEAR, CLOSE, FAR, DISTANT, REMOTE)
  - `precise`: Shows actual game measurements (e.g., "25ft", "10m")
- **Implementation**: New setting in `settings.js`, integrated into label rendering in `renderer.js`

### 2. Token State Matrix System ✅
- **File**: `scripts/state-matrix.js`
- **Purpose**: Tracks relationships between all tokens in real-time
- **Features**:
  - Maintains distance category for each token pair
  - Detects when tokens move between categories
  - Optional notifications for state changes
  - Provides advance/retreat position calculations

### 3. Distance Labels ✅
- **Implementation**: Labels appear at center of lines between tokens
- **Modes**: 
  - Abstracted mode: Shows category names (NEAR, CLOSE, etc.)
  - Precise mode: Shows actual distances with units
- **Setting**: `showDistanceLabels` (default: true)

### 4. Advance/Retreat Movement ⚠️ (NEEDS DEBUGGING)
- **Implementation**: Keyboard shortcuts instead of context menu
- **Controls**:
  - Select token → Target another token → **Shift + =** to advance
  - Select token → Target another token → **Shift + -** to retreat
- **Files**: `scripts/context-menu.js`, integrated in `scripts/main.js`

## Current Issues Requiring Debug

### Issue 1: Advance/Retreat Not Working
**Problem**: Keyboard shortcuts may not be properly registered or functioning
**Debug Steps Needed**:
1. Check if keybindings appear in FoundryVTT's Configure Controls
2. Verify global functions `relationalAdvance()` and `relationalRetreat()` are available
3. Test console commands directly
4. Ensure state matrix is properly calculating advance/retreat positions

### Issue 2: State Matrix Integration
**Problem**: State matrix may not be updating correctly with token movements
**Debug Steps Needed**:
1. Verify state matrix updates on token position changes
2. Check if relationship calculations are accurate
3. Ensure state change notifications work (if enabled)

### Issue 3: Context Menu Alternative
**Problem**: Original plan was right-click context menu, but implemented keyboard shortcuts instead
**Options**:
1. Debug and implement proper FoundryVTT context menu integration
2. Improve keyboard shortcut UX with better notifications
3. Add hotbar macro alternatives

## Settings Added in Phase 2

```javascript
// Distance mode selection
distanceMode: 'abstracted' | 'precise'

// Distance label display
showDistanceLabels: boolean (default: true)

// State change notifications  
showStateNotifications: boolean (default: false)
```

## New Keybindings

```javascript
// Toggle module (from Phase 1)
'Shift + M': Toggle relational movement overlay

// Phase 2 additions
'Shift + =': Advance selected token towards targeted token
'Shift + -': Retreat selected token from targeted token
```

## Testing Checklist

### Basic Functionality
- [ ] Module loads without errors
- [ ] Distance labels show correctly in both modes
- [ ] Settings can be changed and take effect
- [ ] State matrix updates when tokens move

### Advance/Retreat Testing
- [ ] Keybindings appear in Configure Controls
- [ ] Select token + target token + Shift+= moves token closer
- [ ] Select token + target token + Shift+- moves token farther
- [ ] Movement respects token ownership permissions
- [ ] Console functions `relationalAdvance()` and `relationalRetreat()` work

### State Matrix Testing
- [ ] Tokens moving between categories trigger state changes
- [ ] State change notifications appear (if enabled)
- [ ] Relationships are calculated correctly for all visible tokens

## Debug Commands

```javascript
// Check if module is loaded
CONFIG.relationalMovement

// Check state matrix
window.relationalMovement.stateMatrix

// Test advance/retreat manually
relationalAdvance()
relationalRetreat()

// Check current token states
window.relationalMovement.stateMatrix.stateMatrix

// Force state matrix update
window.relationalMovement.stateMatrix.updateMatrix()
```

## Architecture Notes

### File Structure
```
scripts/
├── main.js              # Core module, imports all others
├── settings.js          # All configuration settings
├── renderer.js          # Visual rendering (rings, lines, labels)
├── distance-calc.js     # Distance calculations and categories
├── state-matrix.js      # Token relationship tracking (NEW)
├── context-menu.js      # Advance/retreat functionality (NEW)
└── table-ui.js         # Distance table display
```

### Integration Points
- State matrix updates on `updateToken` and `refreshToken` hooks
- Advance/retreat functions are globally accessible for macros
- Settings changes should trigger visual updates
- Keyboard shortcuts registered in `init` hook

## Next Steps

1. **Debug current implementation** - Focus on advance/retreat functionality
2. **Improve UX** - Better feedback for advance/retreat actions
3. **Context menu** - Implement proper right-click integration if needed
4. **Performance** - Optimize state matrix for larger token counts
5. **Phase 3 planning** - Additional features based on Phase 2 success

## Known Limitations

- Advance/retreat uses simple linear movement (doesn't account for walls/obstacles)
- State matrix recalculates on every token movement (could be optimized)
- No visual preview of advance/retreat destination
- Context menu integration more complex than expected in FoundryVTT