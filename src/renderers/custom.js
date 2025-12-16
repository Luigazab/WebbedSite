import * as Blockly from 'blockly/core';

class CustomConstantProvider extends Blockly.zelos.ConstantProvider {
  constructor() {
    super();

    // Enable hats on start blocks
    this.ADD_START_HATS = true;

    // // Override constants if you want
    // this.NOTCH_WIDTH = 20;
    // this.NOTCH_HEIGHT = 10;
    // this.CORNER_RADIUS = 2;
    // this.TAB_HEIGHT = 8;
  }

  init() {
    super.init();
  }
}

class CustomRenderer extends Blockly.zelos.Renderer {
  constructor() {
    super();
  }
  makeConstants_() {
    return new CustomConstantProvider();
  }
}

Blockly.blockRendering.register('custom_renderer', CustomRenderer);
