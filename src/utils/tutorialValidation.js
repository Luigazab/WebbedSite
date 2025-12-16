/**
 * Tutorial Step Validation Utilities
 * Validates if the current workspace matches the expected tutorial step requirements
 */

/**
 * Check if the workspace contains all required blocks for the current step
 */
export const validateBlocksPresent = (workspaceJson, expectedBlocks) => {
  if (!expectedBlocks || !workspaceJson?.blocks?.blocks) {
    return false;
  }

  const currentBlocks = workspaceJson.blocks.blocks;
  
  // Count blocks by type
  const currentBlockCounts = {};
  currentBlocks.forEach(block => {
    currentBlockCounts[block.type] = (currentBlockCounts[block.type] || 0) + 1;
  });

  // Check if all expected blocks are present
  for (const [blockType, count] of Object.entries(expectedBlocks)) {
    if ((currentBlockCounts[blockType] || 0) < count) {
      return false;
    }
  }

  return true;
};

/**
 * Validate by checking if specific block configurations match
 */
export const validateBlockConfiguration = (workspaceJson, expectedConfig) => {
  if (!expectedConfig || !workspaceJson?.blocks?.blocks) {
    return false;
  }

  const blocks = workspaceJson.blocks.blocks;

  // Find block by type and validate its fields
  const targetBlock = blocks.find(b => b.type === expectedConfig.type);
  
  if (!targetBlock) return false;

  // Check fields if specified
  if (expectedConfig.fields) {
    for (const [fieldName, expectedValue] of Object.entries(expectedConfig.fields)) {
      const actualValue = targetBlock.fields?.[fieldName];
      if (actualValue !== expectedValue) {
        return false;
      }
    }
  }

  // Check inputs if specified
  if (expectedConfig.inputs) {
    for (const [inputName, expectedInput] of Object.entries(expectedConfig.inputs)) {
      const actualInput = targetBlock.inputs?.[inputName];
      if (!actualInput) return false;
      
      // Recursively check nested blocks
      if (expectedInput.block) {
        const nestedBlock = actualInput.block;
        if (!nestedBlock || nestedBlock.type !== expectedInput.block.type) {
          return false;
        }
      }
    }
  }

  return true;
};

/**
 * Validate by checking the generated code output
 */
export const validateGeneratedCode = (generatedCode, expectedPatterns) => {
  if (!expectedPatterns || !generatedCode) {
    return false;
  }

  // Check if all expected patterns exist in the code
  for (const pattern of expectedPatterns) {
    if (typeof pattern === 'string') {
      if (!generatedCode.includes(pattern)) {
        return false;
      }
    } else if (pattern instanceof RegExp) {
      if (!pattern.test(generatedCode)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Flexible validation that tries multiple strategies
 */
export const validateTutorialStep = (step, workspaceJson, generatedCode) => {
  if (!step) return false;

  // Strategy 1: Check for specific blocks
  if (step.expected_blocks) {
    const blocksValid = validateBlocksPresent(workspaceJson, step.expected_blocks);
    if (!blocksValid) return false;
  }

  // Strategy 2: Check block configuration
  if (step.expected_config) {
    const configValid = validateBlockConfiguration(workspaceJson, step.expected_config);
    if (!configValid) return false;
  }

  // Strategy 3: Check generated code patterns
  if (step.expected_code_patterns) {
    const codeValid = validateGeneratedCode(generatedCode, step.expected_code_patterns);
    if (!codeValid) return false;
  }

  // Strategy 4: Simple check - just verify workspace is not empty
  if (!step.expected_blocks && !step.expected_config && !step.expected_code_patterns) {
    return workspaceJson?.blocks?.blocks?.length > 0;
  }

  return true;
};

/**
 * Get helpful feedback for why validation failed
 */
export const getValidationFeedback = (step, workspaceJson, generatedCode) => {
  const feedback = [];

  if (step.expected_blocks) {
    const currentBlocks = workspaceJson?.blocks?.blocks || [];
    const currentBlockCounts = {};
    currentBlocks.forEach(block => {
      currentBlockCounts[block.type] = (currentBlockCounts[block.type] || 0) + 1;
    });

    for (const [blockType, count] of Object.entries(step.expected_blocks)) {
      const currentCount = currentBlockCounts[blockType] || 0;
      if (currentCount < count) {
        feedback.push(`Need ${count - currentCount} more "${blockType}" block(s)`);
      }
    }
  }

  if (step.expected_code_patterns) {
    for (const pattern of step.expected_code_patterns) {
      if (typeof pattern === 'string' && !generatedCode.includes(pattern)) {
        feedback.push(`Code should include: "${pattern}"`);
      }
    }
  }

  return feedback;
};

/**
 * Example validation schemas for common tutorial steps
 */
export const VALIDATION_EXAMPLES = {
  // Example: Checking for specific block types
  blockCount: {
    expected_blocks: {
      'html_structure': 1,
      'heading': 1,
      'paragraph': 1
    }
  },
  
  // Example: Checking block configuration
  blockConfig: {
    expected_config: {
      type: 'heading',
      fields: {
        LEVEL: 'h1',
        TEXT: 'Welcome'
      }
    }
  },
  
  // Example: Checking generated code
  codePattern: {
    expected_code_patterns: [
      '<h1>',
      '<p>',
      /background-color:\s*#[0-9a-fA-F]{6}/
    ]
  }
};