# Phase 1: Foundation & MVP - Detailed Roadmap
*Duration: 2 weeks (10 working days)*

## Overview
Build the foundational system and deliver a working MVP that displays colored rings around a selected token to show distance categories to other tokens.

## Week 1: Project Foundation

### Day 1: Project Setup & Structure
**Tasks:**
- [x] Create `module.json` manifest file
  - Set module ID, title, description
  - Define FoundryVTT compatibility (v11+)
  - Set initial version (0.1.0)
- [x] Create basic directory structure:
  ```
  /scripts/main.js
  /scripts/settings.js
  /scripts/distance-calc.js
  /styles/module.css
  /lang/en.json
  ```
- [x] Initialize main.js with module registration
- [x] Set up basic module hooks (init, ready)

**Deliverable:** Working module that loads in FoundryVTT without errors

### Day 2: Distance Calculation Core
**Tasks:**
- [x] Implement `calculateDistance()` function using Euclidean formula
- [x] Create `getDistanceCategory()` function with hardcoded thresholds:
  - Near: 0-1m
  - Close: 1-10m  
  - Far: 10-25m
  - Distant: 25-100m
  - Remote: 100m+
- [ ] Add unit tests for distance calculations
- [x] Handle edge cases (same position, invalid coordinates)

**Deliverable:** Reliable distance calculation system

### Day 3: Token Management System
**Tasks:**
- [x] Create `getValidTokens()` function to filter actor tokens
- [ ] Implement `getSelectedToken()` to get reference token
- [x] Add `getTokenRelationships()` to map distances between tokens
- [x] Handle token selection events with `controlToken` hook
- [x] Add basic error handling for invalid/deleted tokens

**Deliverable:** Token relationship mapping system

### Day 4: Basic Canvas Rendering
**Tasks:**
- [x] Create `RingRenderer` class for canvas drawing
- [x] Implement `drawCategoryRing()` method
- [x] Add basic color system (hardcoded green→red gradient)
- [x] Integrate with FoundryVTT canvas layers
- [x] Add `clearAllRings()` cleanup method

**Deliverable:** Basic ring drawing capability

### Day 5: Color System & Visual Polish
**Tasks:**
- [x] Implement color gradient calculation:
  - Near: #FF0000 (red)
  - Close: #FF8000 (orange) 
  - Far: #FFFF00 (yellow)
  - Distant: #80FF00 (light green)
  - Remote: #00FF00 (green)
- [x] Add transparency support (default 50% opacity)
- [x] Implement ring sizing based on category
- [x] Add visual feedback for selected token

**Deliverable:** Visually polished ring display

## Week 2: Integration & MVP Completion

### Day 6: FoundryVTT Hook Integration
**Tasks:**
- [x] Connect to `updateToken` hook for real-time updates
- [x] Add `deleteToken` hook handling
- [x] Implement scene change detection (`canvasReady`)
- [ ] Add proper cleanup on module disable
- [ ] Test hook reliability with token movement

**Deliverable:** Real-time updating ring system

### Day 7: Module Activation/Toggle
**Tasks:**
- [x] Create module state management (enabled/disabled)
- [x] Add toggle functionality with state persistence
- [ ] Implement `refreshDisplay()` method
- [ ] Create basic on/off indicator
- [x] Add keyboard shortcut (Ctrl+M) for quick toggle

**Deliverable:** User-controlled module activation

### Day 8: Performance & Optimization
**Tasks:**
- [x] Implement basic performance limits (max 50 tokens for MVP)
- [ ] Add render throttling for rapid updates
- [ ] Optimize distance calculations (skip distant tokens)
- [ ] Add performance monitoring console logs
- [ ] Test with various token counts

**Deliverable:** Performance-optimized MVP

### Day 9: Testing & Bug Fixes
**Tasks:**
- [ ] Test with different game systems (DnD5e, PF2e)
- [ ] Validate token selection edge cases
- [ ] Test scene switching and token deletion
- [ ] Fix any rendering issues or console errors
- [ ] Verify module load/unload cycles

**Deliverable:** Stable, tested MVP

### Day 10: Documentation & Polish
**Tasks:**
- [ ] Create basic README.md with installation instructions
- [ ] Add inline code comments
- [ ] Create simple user guide
- [ ] Package module for testing
- [ ] Prepare for Phase 2 development

**Deliverable:** Documented, distributable MVP

## Acceptance Criteria

### Core Functionality
- ✅ Module loads without errors in FoundryVTT
- ✅ Selecting a token displays colored rings around other tokens
- ✅ Ring colors correctly represent distance categories
- ✅ Rings update in real-time as tokens move
- ✅ Module can be toggled on/off
- ✅ Performance is acceptable with up to 50 tokens

### Visual Requirements
- ✅ Rings use green→red color gradient
- ✅ Rings are semi-transparent (50% opacity)
- ✅ Visual feedback shows selected reference token
- ✅ Rings clear when module is disabled

### Technical Requirements
- ✅ System-agnostic (works with any game system)
- ✅ Proper FoundryVTT hook integration
- ✅ Clean module registration and lifecycle
- ✅ Error handling for edge cases
- ✅ No console errors during normal operation

## Phase 1 Success Metrics
- Module successfully demonstrates core concept
- Users can understand distance relationships at a glance
- Performance remains smooth during normal gameplay
- Foundation is solid for Phase 2 feature additions
- Zero critical bugs in core functionality

## Technical Specifications

### Distance Categories (Hardcoded for MVP)
```javascript
const DISTANCE_CATEGORIES = {
  NEAR: { max: 1, color: '#FF0000', label: 'Near' },
  CLOSE: { max: 10, color: '#FF8000', label: 'Close' },
  FAR: { max: 25, color: '#FFFF00', label: 'Far' },
  DISTANT: { max: 100, color: '#80FF00', label: 'Distant' },
  REMOTE: { max: Infinity, color: '#00FF00', label: 'Remote' }
};
```

### Performance Targets
- Supports up to 50 tokens without lag
- Ring updates complete within 16ms (60fps)
- Module initialization under 100ms
- Memory usage under 10MB

## Risk Mitigation
- **Canvas API Issues**: Test early with FoundryVTT canvas integration
- **Performance Problems**: Implement limits and monitoring from start
- **Token Edge Cases**: Comprehensive testing with various scenarios
- **Hook Reliability**: Fallback mechanisms for update failures

## Next Phase Preparation
- Document lessons learned and technical debt
- Identify areas needing refactoring for Phase 2
- Plan settings system architecture
- Prepare for line tracing implementation