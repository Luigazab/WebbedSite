// src/utils/blocklyManager.js
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { supabase } from '../supabaseClient';

export const initializeBlocklyFromDb = async () => {
  try {
    // 1. Fetch blocks
    const { data: blocks, error } = await supabase
      .from('blocks')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    // 2. Register Blocks (The JSONB Magic)
    // We map over the rows to extract just the definition column
    const blockDefinitions = blocks.map(b => b.definition);
    Blockly.defineBlocksWithJsonArray(blockDefinitions);

    // 3. Register Dynamic Generators
    registerDynamicGenerators(blocks);

    return blocks; // Return data to be used for the toolbox
  } catch (error) {
    console.error('Blockly Initialization Error:', error);
    throw error;
  }
};

const registerDynamicGenerators = (blocks) => {
  blocks.forEach(block => {
    if (!block.code_template) return;

    javascriptGenerator.forBlock[block.block_name] = function(blockInstance, generator) {
      const def = block.definition;
      const args = def.args0 || [];
      let code = block.code_template;

      // Iterate arguments to replace placeholders
      args.forEach((arg, index) => {
        const placeholder = `%${index + 1}`;
        let value = '';

        if (['field_input', 'field_dropdown', 'field_number', 'field_colour'].includes(arg.type)) {
          value = blockInstance.getFieldValue(arg.name);
        } else if (arg.type === 'field_checkbox') {
          // Checkbox special handling for HTML attributes (like controls)
          const bool = blockInstance.getFieldValue(arg.name) === 'TRUE';
          // If the arg has specific checked/unchecked values in JSON, use those, else default
          value = bool ? (arg.checked_value || 'true') : (arg.unchecked_value || 'false'); 
        } else if (arg.type === 'input_value') {
          value = generator.valueToCode(blockInstance, arg.name, javascriptGenerator.ORDER_NONE) || '';
        } else if (arg.type === 'input_statement') {
          value = generator.statementToCode(blockInstance, arg.name) || '';
        }

        // Global replace of the placeholder
        code = code.split(placeholder).join(value);
      });

      // Handle return type based on whether it's an output block or statement block
      if (def.output) {
        return [code, javascriptGenerator.ORDER_ATOMIC];
      } else {
        return code + '\n';
      }
    };
  });
};