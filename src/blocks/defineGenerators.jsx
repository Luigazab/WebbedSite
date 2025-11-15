import { javascriptGenerator } from 'blockly/javascript';

export const defineGenerators = () => {
  javascriptGenerator.forBlock['html_boilerplate'] = function(block, generator) {
    const head = generator.statementToCode(block, 'HEAD');
    const body = generator.statementToCode(block, 'BODY');
    return `<!DOCTYPE html>\n<html>\n<head>\n${head}</head>\n<body>\n${body}</body>\n</html>`;
  };

  javascriptGenerator.forBlock['html_element'] = function(block, generator) {
    const tag = block.getFieldValue('TAG');
    const content = generator.statementToCode(block, 'CONTENT');
    return `<${tag}>\n${content}</${tag}>\n`;
  };

  javascriptGenerator.forBlock['html_text'] = function(block){
    const text = block.getFieldValue('TEXT');
    return text + '\n';
  };

  javascriptGenerator.forBlock['html_title'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `<title>${text}<title/>\n`;
  };

  javascriptGenerator.forBlock['html_style'] = function(block, generator) {
    const css = generator.statementToCode(block, 'CSS');
    return `<style>\n${css}</style>\n`;
  };

  javascriptGenerator.forBlock['css_rule'] = function(block, generator) {
    const selector = block.getFieldValue('SELECTOR');
    const props = generator.statementToCode(block, 'PROPERTIES');
    return `${selector} {\n${props}}\n`;
  };

  javascriptGenerator.forBlock['css_property'] = function(block) {
    const prop = block.getFieldValue('PROPERTY');
    const val = block.getFieldValue('VALUE');
    return `  ${prop}: ${val};\n`;
  }
}
