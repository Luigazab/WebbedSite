import { javascriptGenerator } from 'blockly/javascript';

export const defineGenerators = () => {
  // ===== HTML STRUCTURE =====
  javascriptGenerator.forBlock['html_boilerplate'] = function(block, generator) {
    const head = generator.statementToCode(block, 'HEAD');
    const body = generator.statementToCode(block, 'BODY');
    return `<!DOCTYPE html>\n<html>\n<head>\n${head}</head>\n<body>\n${body}</body>\n</html>`;
  };

  // ===== HEAD ELEMENTS =====
  javascriptGenerator.forBlock['html_title'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `<title>${text}</title>\n`;
  };

  javascriptGenerator.forBlock['html_meta'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const value = block.getFieldValue('VALUE');
    
    if (type === 'charset') {
      return `<meta charset="${value}">\n`;
    } else if (type === 'viewport') {
      return `<meta name="viewport" content="${value}">\n`;
    } else {
      return `<meta name="${type}" content="${value}">\n`;
    }
  };

  javascriptGenerator.forBlock['html_link'] = function(block) {
    const rel = block.getFieldValue('REL');
    const href = block.getFieldValue('HREF');
    return `<link rel="${rel}" href="${href}">\n`;
  };

  javascriptGenerator.forBlock['html_style'] = function(block, generator) {
    const css = generator.statementToCode(block, 'CSS');
    return `<style>\n${css}</style>\n`;
  };

  // ===== CONTAINER ELEMENTS =====
  javascriptGenerator.forBlock['html_div'] = function(block, generator) {
    const className = block.getFieldValue('CLASS');
    const id = block.getFieldValue('ID');
    const content = generator.statementToCode(block, 'CONTENT');
    
    let attrs = '';
    if (className) attrs += ` class="${className}"`;
    if (id) attrs += ` id="${id}"`;
    
    return `<div${attrs}>\n${content}</div>\n`;
  };

  javascriptGenerator.forBlock['html_section'] = function(block, generator) {
    const className = block.getFieldValue('CLASS');
    const content = generator.statementToCode(block, 'CONTENT');
    const classAttr = className ? ` class="${className}"` : '';
    return `<section${classAttr}>\n${content}</section>\n`;
  };

  javascriptGenerator.forBlock['html_header'] = function(block, generator) {
    const content = generator.statementToCode(block, 'CONTENT');
    return `<header>\n${content}</header>\n`;
  };

  javascriptGenerator.forBlock['html_footer'] = function(block, generator) {
    const content = generator.statementToCode(block, 'CONTENT');
    return `<footer>\n${content}</footer>\n`;
  };

  javascriptGenerator.forBlock['html_nav'] = function(block, generator) {
    const content = generator.statementToCode(block, 'CONTENT');
    return `<nav>\n${content}</nav>\n`;
  };

  javascriptGenerator.forBlock['html_main'] = function(block, generator) {
    const content = generator.statementToCode(block, 'CONTENT');
    return `<main>\n${content}</main>\n`;
  };

  // ===== TEXT ELEMENTS =====
  javascriptGenerator.forBlock['html_heading'] = function(block) {
    const level = block.getFieldValue('LEVEL');
    const text = block.getFieldValue('TEXT');
    return `<${level}>${text}</${level}>\n`;
  };

  javascriptGenerator.forBlock['html_paragraph'] = function(block, generator) {
    const content = generator.statementToCode(block, 'CONTENT');
    return `<p>\n${content}</p>\n`;
  };

  javascriptGenerator.forBlock['html_text'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return text + '\n';
  };

  javascriptGenerator.forBlock['html_span'] = function(block, generator) {
    const className = block.getFieldValue('CLASS');
    const content = generator.statementToCode(block, 'CONTENT');
    const classAttr = className ? ` class="${className}"` : '';
    return `<span${classAttr}>${content}</span>\n`;
  };

  // ===== MEDIA ELEMENTS =====
  javascriptGenerator.forBlock['html_image'] = function(block) {
    const src = block.getFieldValue('SRC');
    const alt = block.getFieldValue('ALT');
    return `<img src="${src}" alt="${alt}">\n`;
  };

  javascriptGenerator.forBlock['html_video'] = function(block) {
    const src = block.getFieldValue('SRC');
    const controls = block.getFieldValue('CONTROLS') === 'TRUE';
    const controlsAttr = controls ? ' controls' : '';
    return `<video src="${src}"${controlsAttr}></video>\n`;
  };

  // ===== INTERACTIVE ELEMENTS =====
  javascriptGenerator.forBlock['html_link_element'] = function(block, generator) {
    const href = block.getFieldValue('HREF');
    const content = generator.statementToCode(block, 'CONTENT');
    return `<a href="${href}">${content}</a>\n`;
  };

  javascriptGenerator.forBlock['html_button'] = function(block) {
    const text = block.getFieldValue('TEXT');
    const className = block.getFieldValue('CLASS');
    const classAttr = className ? ` class="${className}"` : '';
    return `<button${classAttr}>${text}</button>\n`;
  };

  javascriptGenerator.forBlock['html_input'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const placeholder = block.getFieldValue('PLACEHOLDER');
    const placeholderAttr = placeholder ? ` placeholder="${placeholder}"` : '';
    return `<input type="${type}"${placeholderAttr}>\n`;
  };

  // ===== LIST ELEMENTS =====
  javascriptGenerator.forBlock['html_list'] = function(block, generator) {
    const type = block.getFieldValue('TYPE');
    const items = generator.statementToCode(block, 'ITEMS');
    return `<${type}>\n${items}</${type}>\n`;
  };

  javascriptGenerator.forBlock['html_list_item'] = function(block, generator) {
    const content = generator.statementToCode(block, 'CONTENT');
    return `<li>${content}</li>\n`;
  };

  // ===== CSS RULES =====
  javascriptGenerator.forBlock['css_rule'] = function(block, generator) {
    const selector = block.getFieldValue('SELECTOR');
    const props = generator.statementToCode(block, 'PROPERTIES');
    return `${selector} {\n${props}}\n`;
  };

  // ===== CSS PROPERTIES - Text/Color =====
  javascriptGenerator.forBlock['css_color'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  color: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_background'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  background: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_font_size'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  font-size: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_font_family'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  font-family: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_text_align'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  text-align: ${value};\n`;
  };

  // ===== CSS PROPERTIES - Box Model =====
  javascriptGenerator.forBlock['css_margin'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  margin: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_padding'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  padding: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_border'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  border: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_border_radius'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  border-radius: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_width'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  width: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_height'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  height: ${value};\n`;
  };

  // ===== CSS PROPERTIES - Layout =====
  javascriptGenerator.forBlock['css_display'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  display: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_flexbox'] = function(block) {
    const direction = block.getFieldValue('DIRECTION');
    const justify = block.getFieldValue('JUSTIFY');
    const align = block.getFieldValue('ALIGN');
    
    return `  display: flex;\n  flex-direction: ${direction};\n  justify-content: ${justify};\n  align-items: ${align};\n`;
  };

  javascriptGenerator.forBlock['css_position'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return `  position: ${value};\n`;
  };

  javascriptGenerator.forBlock['css_custom'] = function(block) {
    const property = block.getFieldValue('PROPERTY');
    const value = block.getFieldValue('VALUE');
    return `  ${property}: ${value};\n`;
  };

  // ===== ATTRIBUTE BLOCK =====
  javascriptGenerator.forBlock['html_attribute'] = function(block, generator) {
    const element = generator.valueToCode(block, 'ELEMENT', javascriptGenerator.ORDER_ATOMIC);
    const attr = block.getFieldValue('ATTR');
    const value = block.getFieldValue('VALUE');
    // Note: This block is complex - it would need runtime JavaScript to actually set attributes
    // For static HTML generation, this is informational
    return `<!-- Set ${attr}="${value}" on element -->\n`;
  };
};