# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FoundryVTT module called "Movement Categories" that provides a combat overlay displaying movement categories between tokens based on relative distances. The module abstracts token movement into categorical chunks (Near, Close, Far, Distant, Remote) rather than exact measurements.

## Key Requirements from prompt.md

- **System Agnostic**: Must work with any FoundryVTT game system
- **Distance Categories**: Near (1m), Close (10m), Far (25m), Distant (100m), Remote (100m+)
- **Visual Modes**: Colored rings around tokens OR line tracing between tokens
- **Color Scheme**: Green gradient (far) → Red gradient (near)
- **Performance**: Support up to 200 tokens with configurable limits
- **Permissions**: Players see only owned tokens, GM sees all including hidden
- **Real-time Updates**: Categories update immediately as tokens move

## Module Architecture

Based on the requirements, the module should be structured as:

```
/
├── module.json                 # FoundryVTT module manifest
├── scripts/
│   ├── main.js                # Module initialization and hooks
│   ├── settings.js            # Configuration settings handler
│   ├── renderer.js            # Visual rendering engine (rings/lines)
│   ├── distance-calc.js       # Distance calculation utilities
│   └── ui-controls.js         # UI controls and macro handlers
├── styles/
│   └── module.css             # Module styling
└── lang/
    └── en.json                # Localization
```

## Key Technical Considerations

- **Canvas Integration**: Must integrate with FoundryVTT's canvas rendering pipeline
- **Hook Integration**: Use token movement hooks for real-time updates
- **Settings API**: Leverage Foundry's settings system for all configuration
- **Performance**: Implement efficient distance calculation (Euclidean) and rendering
- **Cleanup**: Proper cleanup when module disabled or scene changes
- **Error Handling**: Graceful handling of deleted/invalid token references

## Development Commands

Since this is a new project with only prompt.md, standard FoundryVTT module development commands would be:

- Test module: Install in FoundryVTT's `Data/modules/` directory and enable in world
- Debug: Use browser developer tools with FoundryVTT's console
- Package: Create zip file excluding development files for distribution

## FoundryVTT Specific Notes

- **Module Manifest**: Requires proper module.json with FoundryVTT compatibility
- **Hooks**: Primary integration points are `updateToken`, `controlToken`, `deleteToken`
- **Canvas Layers**: Visual elements should be added to appropriate canvas layers
- **Game Settings**: Use `game.settings.register()` for all configuration options
- **Localization**: Support i18n for text labels and UI elements