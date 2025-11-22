import * as Blockly from 'blockly/core';

export const defineBlocks = () => {
  Blockly.Blocks['html_boilerplate'] = {
    init: function() {
      this.appendDummyInput().appendField("HTML Document");
      this.appendStatementInput("HEAD").setCheck("head_element").appendField("head");
      this.appendStatementInput("BODY").setCheck("body_element").appendField("body");
      this.setColour("#e24d25"); //HTML color
      this.setTooltip("Basic HTML document structure");
    }
  };
  Blockly.Blocks['html_text'] = {
    init: function() {
      this.appendDummyInput().appendField("text").appendField(new Blockly.FieldTextInput("Hello World"), "TEXT");
      this.setPreviousStatement(true, "html_element");
      this.setNextStatement(true, "html_element");
      this.setColour(160);
    }
  };
  Blockly.Blocks['html_title'] = {
    init: function() {
      this.appendDummyInput().appendField("title").appendField(new Blockly.FieldTextInput("My Page"), "TEXT");
      this.setPreviousStatement(true, "head_element");
      this.setNextStatement(true,"head_element");
      this.setColour(230);
      this.setTooltip("Page title shown in browser tab");
    }
  };
  Blockly.Blocks['html_meta'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("meta")
        .appendField(new Blockly.FieldDropdown([
          ["charset", "charset"],
          ["viewport", "viewport"],
          ["description", "description"],
          ["keywords", "keywords"],
          ["author", "author"]
        ]), "TYPE")
        .appendField("=")
        .appendField(new Blockly.FieldTextInput("utf-8"), "VALUE");
      this.setPreviousStatement(true, "head_element");
      this.setNextStatement(true, "head_element");
      this.setColour("#8B5CF6");
      this.setTooltip("Meta information for the page");
    }
  };
  Blockly.Blocks['html_link'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("link")
        .appendField(new Blockly.FieldDropdown([
          ["stylesheet", "stylesheet"],
          ["icon", "icon"],
          ["preconnect", "preconnect"]
        ]), "REL")
        .appendField("href:")
        .appendField(new Blockly.FieldTextInput("style.css"), "HREF");
      this.setPreviousStatement(true, "head_element");
      this.setNextStatement(true, "head_element");
      this.setColour("#8B5CF6");
      this.setTooltip("Link to external resources");
    }
  };
  Blockly.Blocks['html_style'] = {
    init: function() {
      this.appendDummyInput().appendField("style");
      this.appendStatementInput("CSS").setCheck("css_element");
      this.setPreviousStatement(true, "head_element");
      this.setNextStatement(true,"head_element");
      this.setColour("#8B5CF6");
      this.setTooltip("Internal CSS styles");
    }
  };

  Blockly.Blocks['html_div'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("div")
        .appendField("class:")
        .appendField(new Blockly.FieldTextInput(""), "CLASS")
        .appendField("id:")
        .appendField(new Blockly.FieldTextInput(""), "ID");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#10B981");
      this.setTooltip("Container division element");
    }
  };

  Blockly.Blocks['html_section'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("section")
        .appendField("class:")
        .appendField(new Blockly.FieldTextInput(""), "CLASS");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#10B981");
      this.setTooltip("Section container");
    }
  };

  Blockly.Blocks['html_header'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("header");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#10B981");
    }
  };

  Blockly.Blocks['html_footer'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("footer");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#10B981");
    }
  };

  Blockly.Blocks['html_nav'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("nav");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#10B981");
    }
  };

  Blockly.Blocks['html_main'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("main");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#10B981");
    }
  };

  // -- Text --
  Blockly.Blocks['html_heading'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("heading")
        .appendField(new Blockly.FieldDropdown([
          ["H1", "h1"], ["H2", "h2"], ["H3", "h3"],
          ["H4", "h4"], ["H5", "h5"], ["H6", "h6"]
        ]), "LEVEL")
        .appendField(new Blockly.FieldTextInput("Heading"), "TEXT");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#F59E0B");
      this.setTooltip("Heading element");
    }
  };

  Blockly.Blocks['html_paragraph'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("paragraph");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#F59E0B");
    }
  };

  Blockly.Blocks['html_text'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("text")
        .appendField(new Blockly.FieldTextInput("Hello World"), "TEXT");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#F59E0B");
    }
  };

  Blockly.Blocks['html_span'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("span")
        .appendField("class:")
        .appendField(new Blockly.FieldTextInput(""), "CLASS");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#F59E0B");
    }
  };

  // -- Media --
  Blockly.Blocks['html_image'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("image")
        .appendField("src:")
        .appendField(new Blockly.FieldTextInput("image.jpg"), "SRC");
      this.appendDummyInput()
        .appendField("alt:")
        .appendField(new Blockly.FieldTextInput("description"), "ALT");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#EC4899");
    }
  };

  Blockly.Blocks['html_video'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("video")
        .appendField("src:")
        .appendField(new Blockly.FieldTextInput("video.mp4"), "SRC");
      this.appendDummyInput()
        .appendField("controls")
        .appendField(new Blockly.FieldCheckbox("TRUE"), "CONTROLS");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#EC4899");
    }
  };

  // -- Interactive --
  Blockly.Blocks['html_link_element'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("link")
        .appendField("href:")
        .appendField(new Blockly.FieldTextInput("#"), "HREF");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#3B82F6");
    }
  };

  Blockly.Blocks['html_button'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("button")
        .appendField(new Blockly.FieldTextInput("Click me"), "TEXT")
        .appendField("class:")
        .appendField(new Blockly.FieldTextInput(""), "CLASS");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#3B82F6");
    }
  };

  Blockly.Blocks['html_input'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("input")
        .appendField(new Blockly.FieldDropdown([
          ["text", "text"], ["email", "email"], ["password", "password"],
          ["number", "number"], ["checkbox", "checkbox"], ["radio", "radio"],
          ["submit", "submit"], ["file", "file"]
        ]), "TYPE")
        .appendField("placeholder:")
        .appendField(new Blockly.FieldTextInput(""), "PLACEHOLDER");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#3B82F6");
    }
  };

  // -- Lists --
  Blockly.Blocks['html_list'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("list")
        .appendField(new Blockly.FieldDropdown([
          ["unordered (ul)", "ul"],
          ["ordered (ol)", "ol"]
        ]), "TYPE");
      this.appendStatementInput("ITEMS")
        .setCheck("list_item");
      this.setPreviousStatement(true, "body_element");
      this.setNextStatement(true, "body_element");
      this.setColour("#6366F1");
    }
  };

  Blockly.Blocks['html_list_item'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("• list item");
      this.appendStatementInput("CONTENT")
        .setCheck("body_element");
      this.setPreviousStatement(true, "list_item");
      this.setNextStatement(true, "list_item");
      this.setColour("#6366F1");
    }
  };

  Blockly.Blocks['css_rule'] = {
    init: function() {
      this.appendDummyInput().appendField("CSS for").appendField(new Blockly.FieldTextInput("body"), "SELECTOR");
      this.appendStatementInput("PROPERTIES").setCheck("css_property");
      this.setPreviousStatement(true, "css_element");
      this.setNextStatement(true, "css_element");
      this.setColour("#0266b1");
    }
  };
  Blockly.Blocks['css_color'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("color")
        .appendField(new Blockly.FieldTextInput("#000000"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#FB7185");
    }
  };

  Blockly.Blocks['css_background'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("background")
        .appendField(new Blockly.FieldTextInput("#ffffff"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#FB7185");
    }
  };

  Blockly.Blocks['css_font_size'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("font-size")
        .appendField(new Blockly.FieldTextInput("16px"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#FB7185");
    }
  };

  Blockly.Blocks['css_font_family'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("font-family")
        .appendField(new Blockly.FieldDropdown([
          ["Arial", "Arial, sans-serif"],
          ["Helvetica", "Helvetica, sans-serif"],
          ["Georgia", "Georgia, serif"],
          ["Times", "Times New Roman, serif"],
          ["Courier", "Courier New, monospace"],
          ["Verdana", "Verdana, sans-serif"]
        ]), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#FB7185");
    }
  };

  Blockly.Blocks['css_text_align'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("text-align")
        .appendField(new Blockly.FieldDropdown([
          ["left", "left"], ["center", "center"],
          ["right", "right"], ["justify", "justify"]
        ]), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#FB7185");
    }
  };

  // -- Box Model CSS --
  Blockly.Blocks['css_margin'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("margin")
        .appendField(new Blockly.FieldTextInput("10px"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#A855F7");
    }
  };

  Blockly.Blocks['css_padding'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("padding")
        .appendField(new Blockly.FieldTextInput("10px"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#A855F7");
    }
  };

  Blockly.Blocks['css_border'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("border")
        .appendField(new Blockly.FieldTextInput("1px solid black"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#A855F7");
    }
  };

  Blockly.Blocks['css_border_radius'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("border-radius")
        .appendField(new Blockly.FieldTextInput("5px"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#A855F7");
    }
  };

  Blockly.Blocks['css_width'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("width")
        .appendField(new Blockly.FieldTextInput("100%"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#A855F7");
    }
  };

  Blockly.Blocks['css_height'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("height")
        .appendField(new Blockly.FieldTextInput("auto"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#A855F7");
    }
  };

  // -- Layout CSS --
  Blockly.Blocks['css_display'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("display")
        .appendField(new Blockly.FieldDropdown([
          ["block", "block"], ["inline", "inline"],
          ["inline-block", "inline-block"], ["flex", "flex"],
          ["grid", "grid"], ["none", "none"]
        ]), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#14B8A6");
    }
  };

  Blockly.Blocks['css_flexbox'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("flex")
        .appendField("direction:")
        .appendField(new Blockly.FieldDropdown([
          ["row", "row"], ["column", "column"],
          ["row-reverse", "row-reverse"], ["column-reverse", "column-reverse"]
        ]), "DIRECTION");
      this.appendDummyInput()
        .appendField("justify:")
        .appendField(new Blockly.FieldDropdown([
          ["flex-start", "flex-start"], ["center", "center"],
          ["flex-end", "flex-end"], ["space-between", "space-between"],
          ["space-around", "space-around"]
        ]), "JUSTIFY");
      this.appendDummyInput()
        .appendField("align:")
        .appendField(new Blockly.FieldDropdown([
          ["stretch", "stretch"], ["center", "center"],
          ["flex-start", "flex-start"], ["flex-end", "flex-end"]
        ]), "ALIGN");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#14B8A6");
    }
  };

  Blockly.Blocks['css_position'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("position")
        .appendField(new Blockly.FieldDropdown([
          ["static", "static"], ["relative", "relative"],
          ["absolute", "absolute"], ["fixed", "fixed"],
          ["sticky", "sticky"]
        ]), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#14B8A6");
    }
  };

  Blockly.Blocks['css_custom'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("custom")
        .appendField(new Blockly.FieldTextInput("property"), "PROPERTY")
        .appendField(":")
        .appendField(new Blockly.FieldTextInput("value"), "VALUE");
      this.setPreviousStatement(true, "css_property");
      this.setNextStatement(true, "css_property");
      this.setColour("#64748B");
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
