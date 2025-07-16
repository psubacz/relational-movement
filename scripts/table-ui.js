export class RelationshipTable {
    static MODULE_ID = 'relational-movement';
    
    constructor() {
        this.dialog = null;
        this.isVisible = false;
        this.currentReferenceToken = null;
    }
    
    createTable(referenceToken, relationships) {
        if (!referenceToken || !relationships) {
            return '';
        }
        
        // Sort relationships by distance category order
        const categoryOrder = { 'NEAR': 1, 'CLOSE': 2, 'FAR': 3, 'DISTANT': 4, 'REMOTE': 5 };
        const sortedRelationships = relationships.sort((a, b) => {
            return categoryOrder[a.category.key] - categoryOrder[b.category.key];
        });
        
        let tableHTML = `
            <div class="relational-movement-table">
                <h3>Distance Relationships from: ${referenceToken.name}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Token Name</th>
                            <th>Distance</th>
                            <th>Category</th>
                            <th>Exact Distance</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        sortedRelationships.forEach(relationship => {
            const bgColor = relationship.category.color;
            const textColor = this.getContrastColor(bgColor);
            
            tableHTML += `
                <tr>
                    <td class="token-name">${relationship.token.name}</td>
                    <td class="distance-visual" style="background-color: ${bgColor}; color: ${textColor};">
                        ${relationship.category.display}
                    </td>
                    <td class="category-name">${relationship.category.key}</td>
                    <td class="exact-distance">${Math.round(relationship.distance * 10) / 10}m</td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
                <div class="table-footer">
                    <small>Total tokens: ${relationships.length}</small>
                </div>
            </div>
        `;
        
        return tableHTML;
    }
    
    getContrastColor(hexColor) {
        // Convert hex to RGB
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return black or white based on luminance
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
    
    showTable(referenceToken, relationships) {
        if (!referenceToken || !relationships || relationships.length === 0) {
            this.hideTable();
            return;
        }
        
        // Store the reference token this table is showing
        this.currentReferenceToken = referenceToken;
        
        const tableContent = this.createTable(referenceToken, relationships);
        
        // Close existing dialog if open
        if (this.dialog) {
            this.dialog.close();
        }
        
        // Create new dialog
        this.dialog = new Dialog({
            title: "Token Distance Relationships",
            content: tableContent,
            buttons: {
                close: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Close",
                    callback: () => this.hideTable()
                }
            },
            default: "close",
            width: 600,
            height: 400,
            resizable: true,
            classes: ["relational-movement-dialog"]
        }, {
            width: 600,
            height: 400,
            resizable: true
        });
        
        this.dialog.render(true);
        this.isVisible = true;
        
        // Add custom styling
        this.addCustomStyling();
    }
    
    hideTable() {
        if (this.dialog) {
            this.dialog.close();
            this.dialog = null;
        }
        this.isVisible = false;
        this.currentReferenceToken = null;
    }
    
    updateTable(referenceToken, relationships) {
        if (this.isVisible && this.dialog) {
            // Only update if this is the same reference token the table is currently showing
            if (this.currentReferenceToken && this.currentReferenceToken.id === referenceToken.id) {
                // Update the content of the existing dialog
                const tableContent = this.createTable(referenceToken, relationships);
                const dialogContent = this.dialog.element.find('.dialog-content');
                if (dialogContent.length) {
                    dialogContent.html(tableContent);
                }
            }
            // If it's a different token, don't update - table stays with original reference token
        }
    }
    
    addCustomStyling() {
        // Add custom CSS if not already added
        if (!document.getElementById('relational-movement-table-styles')) {
            const style = document.createElement('style');
            style.id = 'relational-movement-table-styles';
            style.textContent = `
                .relational-movement-table {
                    font-family: Arial, sans-serif;
                    padding: 10px;
                }
                
                .relational-movement-table h3 {
                    margin: 0 0 15px 0;
                    color: #333;
                    text-align: center;
                }
                
                .relational-movement-table table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10px;
                }
                
                .relational-movement-table th,
                .relational-movement-table td {
                    padding: 8px 12px;
                    text-align: left;
                    border: 1px solid #ddd;
                }
                
                .relational-movement-table th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                    color: #333;
                }
                
                .relational-movement-table tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                
                .relational-movement-table tr:hover {
                    background-color: #f0f0f0;
                }
                
                .relational-movement-table .token-name {
                    font-weight: 500;
                }
                
                .relational-movement-table .distance-visual {
                    font-weight: bold;
                    text-align: center;
                    border-radius: 4px;
                }
                
                .relational-movement-table .category-name {
                    font-family: monospace;
                    font-size: 0.9em;
                }
                
                .relational-movement-table .exact-distance {
                    text-align: right;
                    font-family: monospace;
                }
                
                .relational-movement-table .table-footer {
                    text-align: center;
                    color: #666;
                    font-style: italic;
                }
                
                .relational-movement-dialog .dialog-content {
                    padding: 0;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    toggle(referenceToken, relationships) {
        if (this.isVisible) {
            this.hideTable();
        } else {
            this.showTable(referenceToken, relationships);
        }
    }
    
    destroy() {
        this.hideTable();
        
        // Remove custom styles
        const styleElement = document.getElementById('relational-movement-table-styles');
        if (styleElement) {
            styleElement.remove();
        }
    }
}