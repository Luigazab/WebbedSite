class CustomCategory extends Blockly.ToolboxCategory {
  constructor(categoryDef, toolbox, opt_parent) {
    super(categoryDef, toolbox, opt_parent);
  }
  
  addColourBorder_(colour) {
    this.rowDiv_.style.backgroundColor = colour;
  }
  
  setSelected(isSelected) {
    const labelDom = this.rowDiv_.getElementsByClassName('blocklyToolboxCategoryLabel')[0];
    if (isSelected) {
      this.rowDiv_.style.backgroundColor = 'white';
      labelDom.style.color = this.colour_;
      this.iconDom_.style.color = this.colour_;
    } else {
      this.rowDiv_.style.backgroundColor = this.colour_;
      labelDom.style.color = 'white';
      this.iconDom_.style.color = 'white';
    }
    
    Blockly.utils.aria.setState(
      this.htmlDiv_,
      Blockly.utils.aria.State.SELECTED,
      isSelected
    );
  }
  
  createIconDom_() {
    const icon = document.createElement('i');
    icon.className = 'fa fa-cog';
    icon.style.color = 'white';
    return icon;
  }
}

Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  Blockly.ToolboxCategory.registrationName,
  CustomCategory,
  true
);