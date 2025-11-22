class ToolboxLabel extends Blockly.ToolboxItem {
  constructor(toolboxItemDef, parentToolbox){
    super(toolboxItemDef, parentToolbox);
  }

  init() {
    this.label = document.createElement('label');
    this.label.textContent = this.toolboxItemDef_['name'];
    this.label.style.color = this.toolboxItemDef_['colour'];
    
    const cssConfig = this.toolboxItemDef_['cssconfig'];
    if (cssConfig) {
      this.label.classList.add(cssConfig['label']);
    }
  }
  
  getDiv() {
    return this.label;
  }
}

Blockly.registry.register(
  Blockly.registry.Type.TOOLBOX_ITEM,
  'toolboxlabel',
  ToolboxLabel
);