import * as Blockly from 'blockly';

class CustomCategory extends Blockly.ToolboxCategory {
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);
  }
  
  /** @override */
  createRowContents_() {
    // Call parent implementation first
    super.createRowContents_();
    
    // Apply custom styling immediately after creation
    this.addColourBorder_(this.colour_);
    // Apply cssconfig if it exists
    const cssConfig = this.toolboxItemDef_['cssconfig'];
    if (cssConfig) {
      // Add custom classes
      if (cssConfig['container']) {
        this.rowDiv_.classList.add(cssConfig['row']);
      }
      
      // Apply custom styles directly
      if (cssConfig['backgroundColor']) {
        this.rowDiv_.classList.backgroundColor = cssConfig['backgroundColor'];
      }
      if (cssConfig['border']) {
        this.rowDiv_.classList.border = cssConfig['border'];
      }
    }
  }
  
  /** @override */
  addColourBorder_(colour) {
    // Apply background color to the row
    this.rowDiv_.style.backgroundColor = colour;
    
    // Style the label
    const labelDom = this.rowDiv_.getElementsByClassName('blocklyToolboxCategoryLabel')[0];
    if (labelDom) {
      labelDom.style.color = 'white';
      labelDom.style.fontWeight = '600';
    }
    
    // Style the icon if it exists
    if (this.iconDom_) {
      this.iconDom_.style.color = 'white';
    }
  }
  
  /** @override */
  setSelected(isSelected) {
    const labelDom = this.rowDiv_.getElementsByClassName('blocklyToolboxCategoryLabel')[0];
    
    if (isSelected) {
      // Selected state: white background, colored text
      this.rowDiv_.style.backgroundColor = 'white';
      this.rowDiv_.style.border = `2px solid ${this.colour_}`;
      
      if (labelDom) {
        labelDom.style.color = this.colour_;
      }
      if (this.iconDom_) {
        this.iconDom_.style.color = this.colour_;
      }
    } else {
      // Unselected state: colored background, white text
      this.rowDiv_.style.backgroundColor = this.colour_;
      this.rowDiv_.style.border = '2px solid black';
      
      if (labelDom) {
        labelDom.style.color = 'white';
      }
      if (this.iconDom_) {
        this.iconDom_.style.color = 'white';
      }
    }
    
    // Update ARIA state
    Blockly.utils.aria.setState(
      this.htmlDiv_,
      Blockly.utils.aria.State.SELECTED,
      isSelected
    );
  }
  
  /** @override */
  createIconDom_() {
    const icon = document.createElement('i');
    icon.className = 'fa fa-cog';
    icon.style.color = 'white';
    icon.style.marginRight = '8px';
    return icon;
  }
}

export const registerCustomCategory = () => {
  Blockly.registry.register(
    Blockly.registry.Type.TOOLBOX_ITEM,
    Blockly.ToolboxCategory.registrationName,
    CustomCategory,
    true
  );
};