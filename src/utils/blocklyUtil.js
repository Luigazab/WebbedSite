import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';

export const buildDynamicToolbox = (blocks) => {
  const categoryMap = new Map();
  
  // Group blocks by category and block_type
  blocks.forEach(block => {
    const key = `${block.block_type}:${block.category}`;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        blockType: block.block_type.toLowerCase(),
        category: block.category,
        colour: block.colour || '#64748B',
        blocks: []
      });
    }
    categoryMap.get(key).blocks.push({
      kind: 'block',
      type: block.block_name
    });
  });

  // Build toolbox structure
  const toolboxContents = [];
  
  // Group categories by parent type (HTML/CSS)
  const htmlCategories = [];
  const cssCategories = [];
  
  categoryMap.forEach((data) => {
    const categoryData = {
      kind: 'category',
      name: data.category,
      colour: data.colour,
      contents: data.blocks
    };
    
    if (data.blockType === 'css') {
      cssCategories.push(categoryData);
    } else {
      htmlCategories.push(categoryData);
    }
  });

  // Add HTML parent category if we have HTML blocks
  if (htmlCategories.length > 0) {
    toolboxContents.push({ kind: 'sep' });
    toolboxContents.push({
      kind: 'category',
      name: 'HTML',
      colour: '#f16529',
      cssconfig: {
        row: 'htmlCategory'
      },
      contents: [
        {
          kind: 'toolboxlabel',
          name: 'HTML',
          colour: '#000000',
          cssconfig: {
            label: 'customLabel'
          }
        },
        ...htmlCategories
      ]
    });
  }

  // Add CSS parent category if we have CSS blocks
  if (cssCategories.length > 0) {
    toolboxContents.push({ kind: 'sep' });
    toolboxContents.push({
      kind: 'category',
      name: 'CSS',
      colour: '#29a8e0',
      cssconfig: {
        row: 'cssCategory'
      },
      contents: [
        {
          kind: 'toolboxlabel',
          name: 'CSS',
          colour: '#000000',
          cssconfig: {
            label: 'customLabel',
          }
        },
        ...cssCategories
      ]
    });
    toolboxContents.push({ kind: 'sep' });
  }

  return {
    kind: 'categoryToolbox',
    contents: toolboxContents
  };
};

export const registerBlockWithGenerator = (blockDef) => {
  const definition = blockDef.definition;
  const codeTemplate = blockDef.code_template.replace(/\\n/g, "\n");

  // Register block directly from JSON
  Blockly.defineBlocksWithJsonArray([definition]);

  // Define code generator
  javascriptGenerator.forBlock[blockDef.block_name] = function(block, generator) {
    let code = codeTemplate;

    (definition.args0 || []).forEach(arg => {
      if (!arg.name) return;

      if (arg.type.startsWith("field")) {
        const value = block.getFieldValue(arg.name) || "";
        code = code.replaceAll(`{${arg.name}}`, value);
      }

      if (arg.type === "input_statement") {
        const content = generator.statementToCode(block, arg.name).replace(/\n+$/, "");
        code = code.replaceAll(`{${arg.name}}`, content);
        code = code.replaceAll("{CONTENT}", content);
      }

      if (arg.type === "input_value") {
        const valueCode = generator.valueToCode(block, arg.name, generator.ORDER_NONE) || "";
        code = code.replaceAll(`{${arg.name}}`, valueCode);
      }
    });

    return code + "\n";
  };
};