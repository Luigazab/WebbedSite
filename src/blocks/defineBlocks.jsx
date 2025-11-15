import * as Blockly from 'blockly/core';

export const defineBlocks = () => {
  Blockly.Blocks['html_boilerplate'] = {
    init: function() {
      this.appendDummyInput().appendField("HTML Page");
      this.appendStatementInput("HEAD").setCheck(null).appendField("head");
      this.appendStatementInput("BODY").setCheck(null).appendField("body");
      this.setColour(230);
      this.setTooltip("Basic HTML document structure");
    }
  };
  Blockly.Blocks['html_element'] = {
    init: function() {
      this.appendDummyInput().appendField("element").appendField(new Blockly.FieldDropdown([
        ["div","div"], ["p","p"], ["span","span"], 
        ["h1","h1"], ["h2","h2"], ["h3","h3"], 
        ["a","a"], ["button","button"], ["img","img"],
        ["ul","ul"], ["ol","ol"], ["li","li"] 
      ]), "TAG");
      this.appendStatementInput("CONTENT").setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };
  Blockly.Blocks['html_text'] = {
    init: function() {
      this.appendDummyInput().appendField("text").appendField(new Blockly.FieldTextInput("Hello World"), "TEXT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };
  Blockly.Blocks['html_title'] = {
    init: function() {
      this.appendDummyInput().appendField("title").appendField(new Blockly.FieldTextInput("My Page"), "TEXT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true,null);
      this.setColour(230);
    }
  };
  Blockly.Blocks['html_style'] = {
    init: function() {
      this.appendDummyInput().appendField("style");
      this.appendStatementInput("CSS").setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true,null);
      this.setColour(230);
    }
  };
  Blockly.Blocks['css_rule'] = {
    init: function() {
      this.appendDummyInput().appendField("CSS for").appendField(new Blockly.FieldTextInput("body"), "SELECTOR");
      this.appendStatementInput("PROPERTIES").setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
    }
  };
  Blockly.Blocks['css_property'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["color","color"], ["background-color","background-color"],
            ["font-size","font-size"], ["font-family","font-family"],
            ["margin","margin"], ["padding","padding"],
            ["border","border"], ["width","width"], ["height","height"],
            ["text-align","text-align"], ["display","display"]
          ]), "PROPERTY")
          .appendField(":")
          .appendField(new Blockly.FieldTextInput("value"), "VALUE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(290);
    }
  };
  Blockly.Blocks['html_attribute'] = {
    init: function() {
      this.appendValueInput("ELEMENT").appendField("set attribute");
      this.appendDummyInput()
          .appendField(new Blockly.FieldDropdown([
            ["class","class"], ["id","id"], ["src","src"],
            ["href","href"], ["alt","alt"], ["style","style"]
          ]), "ATTR").appendField("=").appendField(new Blockly.FieldTextInput("value"), "VALUE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
    }
  };
  // Blockly.Blocks[''] = {
  //   init: function() {
  //     this.appendDummyInput().appendField();
  //     this.appendStatementInput().setCheck(null);
  //     this.setColour();
  //   }
  // };
}
