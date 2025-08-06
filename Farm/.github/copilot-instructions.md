# Copilot Instructions for 乡村农场大亨 (Rural Farm Tycoon)

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a farm management simulation game project with the following key features:

## Game Core Systems:
1. **Land & Facility System**: 1201 acres total, 34 different plots, 16 greenhouses
2. **Crop Planting System**: Rotation restrictions, legume rotation requirements
3. **Economic System**: Revenue calculations, dual sales models (direct sales vs discounted bulk)
4. **Random Events & Risk System**: Market fluctuations, weather impacts, cost variations
5. **Strategy & Analytics**: Market data analysis, simulation mode, interactive features

## Technical Requirements:
- Use vanilla JavaScript with modern ES6+ features
- Implement modular architecture with separate classes for each system
- Use Canvas API for game rendering and visualization
- Focus on clean, maintainable code with proper separation of concerns
- Implement responsive design for different screen sizes

## Game Rules:
- 7-year simulation period (2024-2030)
- Crop rotation: same plot cannot grow same crop family consecutively
- Legume requirement: must plant legumes (soybeans) every 3 years on each plot
- Market volatility: wheat prices grow 5-10% annually, other crops ±5% variation
- Greenhouse specialization: regular (vegetables + grains) vs smart (vegetables only)

Please generate code that follows these patterns and implements the game mechanics accurately according to the design document.
