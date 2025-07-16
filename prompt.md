# FoundryVTT Movement Categories Module - Development Prompt

## Module Overview
Create a system-agnostic FoundryVTT module that provides a combat overlay displaying movement categories between tokens based on relative distances. The module should abstract token movement into categorical chunks rather than exact measurements.

## Core Functionality

### Movement Categories
The module should implement the following distance categories:
- **Near**: Up to 1 meter from reference token
- **Close**: Up to 10 meters from reference token  
- **Far**: Up to 25 meters from reference token
- **Distant**: Up to 100 meters from reference token
- **Remote/Out of Sight**: Beyond 100 meters from reference token

### Visual Display Options
Implement two visual display modes (user-selectable):
1. **Colored Rings**: Display colored rings/zones around tokens
2. **Line Tracing**: Draw lines between tokens with category indicators

### Display Characteristics
- **Color Scheme**: Green gradient for far distances → Red gradient for near distances
- **Text Labels**: Display category names ("Near", "Close", etc.) as text overlays
- **Transparency**: Adjustable opacity for all visual indicators
- **Real-time Updates**: Categories update immediately as tokens move to show planned movement effects

## User Interface & Controls

### Toggle Mechanisms
- **Macro Support**: Provide macro commands for activation/deactivation
- **UI Button**: Add toggle button to the UI
- **Auto-Combat**: Automatically activate when combat encounters start (with option to disable)

### Reference Point Modes
- **Default**: Show categories from selected token's perspective
- **Toggle Option**: Switch between "selected token perspective" and "all relationships" view
- **Multiple Selection**: If multiple tokens selected, use first selected token as reference

## Token Handling & Permissions

### Token Scope
- **Included Tokens**: Track all visible actor tokens (PCs and NPCs)
- **Excluded**: Ignore non-actor tokens (objects, etc.)

### Visibility Rules
- **Players**: Only see relationships for tokens they own/control
- **GM**: See all token relationships including hidden/invisible tokens
- **Hidden Tokens**: 
  - GM overlay renders hidden tokens
  - Player overlay ignores hidden tokens

## Technical Specifications

### Distance Calculation
- **Method**: Use Euclidean distance measurement
- **Map Compatibility**: Designed for gridless maps
- **Measurement Unit**: Meters as base unit

### Performance & Limits
- **Default Token Limit**: 200 tokens maximum tracking
- **Configurable**: GM can adjust performance limits
- **Optimization**: Implement efficient distance calculation and rendering

## Configuration Options

### GM World Settings
- **Distance Thresholds**: Customizable category distances (1m, 10m, 25m, 100m)
- **Performance Limits**: Adjustable maximum token tracking count
- **Auto-Combat Toggle**: Enable/disable automatic combat activation
- **Default Visual Mode**: Set default between rings or line tracing

### User Preferences
- **Visual Transparency**: Individual opacity settings
- **Display Mode**: Personal preference for rings vs lines
- **Reference Mode**: Default perspective setting

## Edge Case Handling
- **No Selection**: When no token selected, disable or show message
- **Invalid Tokens**: Gracefully handle deleted or invalid token references
- **Map Changes**: Automatically recalculate when scene changes
- **Combat State**: Properly detect combat start/end for auto-toggle

## Module Structure Requirements

### File Organization
- Main module file with hooks and initialization
- Configuration settings handler
- Visual rendering engine (separate for rings and lines)
- Distance calculation utilities
- UI controls and macro handlers

### FoundryVTT Integration
- **System Agnostic**: Compatible with any game system
- **Hook Integration**: Proper integration with Foundry's token movement hooks
- **Settings API**: Use Foundry's settings system for configuration
- **Canvas Rendering**: Integrate with Foundry's canvas rendering pipeline

### API Considerations
- **Public Methods**: Expose toggle, refresh, and configuration methods
- **Event Handling**: Respond to token updates, combat state changes
- **Cleanup**: Proper cleanup when module disabled or scene changes

## User Experience Goals
- **Intuitive**: Simple toggle on/off functionality
- **Performant**: Smooth real-time updates without lag
- **Customizable**: Flexible configuration for different game styles
- **Accessible**: Clear visual indicators that don't overwhelm the interface

## Development Notes
- Ensure compatibility with major FoundryVTT versions
- Include proper error handling and logging
- Provide clear documentation and setup instructions
- Consider accessibility features for colorblind users
- Test with various token counts and map sizes