import React, { useState, useEffect, useRef } from 'react';

const Playground = () => {
  const [jsonInput, setJsonInput] = useState(`{
  "type": "text_print",
  "message0": "print %1",
  "args0": [
    {
      "type": "input_value",
      "name": "TEXT"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 160,
  "tooltip": "Print text to console",
  "helpUrl": ""
}`);
  const [error, setError] = useState('');
  const workspaceRef = useRef(null);
  const blocklyDiv = useRef(null);

  useEffect(() => {
    // Load Blockly
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/blockly/blockly.min.js';
    script.async = true;
    script.onload = () => {
      initBlockly();
    };
    document.body.appendChild(script);

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
      }
    };
  }, []);

  const initBlockly = () => {
    if (window.Blockly && blocklyDiv.current) {
      workspaceRef.current = window.Blockly.inject(blocklyDiv.current, {
        toolbox: '<xml></xml>',
        renderer: 'zelos',
        readOnly: true,
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        },
        move: {
          scrollbars: true,
          drag: true,
          wheel: true
        }
      });
      
      updateBlock();
    }
  };

  const updateBlock = () => {
    if (!window.Blockly || !workspaceRef.current) return;

    try {
      const blockDef = JSON.parse(jsonInput);
      
      if (!blockDef.type) {
        setError('Block definition must have a "type" property');
        return;
      }

      // Clear workspace
      workspaceRef.current.clear();
      
      // Define the block
      window.Blockly.Blocks[blockDef.type] = {
        init: function() {
          this.jsonInit(blockDef);
        }
      };

      // Create and render the block
      const block = workspaceRef.current.newBlock(blockDef.type);
      block.initSvg();
      block.render();
      block.moveBy(50, 50);
      
      setError('');
    } catch (e) {
      setError(`Error: ${e.message}`);
    }
  };

  const handleUpdateClick = () => {
    updateBlock();
  };

  const loadExample = (example) => {
    const examples = {
      simple: `{
  "type": "math_number",
  "message0": "%1",
  "args0": [
    {
      "type": "field_number",
      "name": "NUM",
      "value": 0
    }
  ],
  "output": "Number",
  "colour": 230,
  "tooltip": "A number",
  "helpUrl": ""
}`,
      dropdown: `{
  "type": "controls_if",
  "message0": "if %1",
  "args0": [
    {
      "type": "input_value",
      "name": "IF0",
      "check": "Boolean"
    }
  ],
  "message1": "do %1",
  "args1": [
    {
      "type": "input_statement",
      "name": "DO0"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 210,
  "tooltip": "If condition is true, do something"
}`,
      complex: `{
  "type": "text_join",
  "message0": "create text with %1",
  "args0": [
    {
      "type": "input_dummy"
    }
  ],
  "message1": "%1",
  "args1": [
    {
      "type": "input_value",
      "name": "ADD0"
    }
  ],
  "output": "String",
  "colour": 160,
  "tooltip": "Join multiple text values",
  "mutator": "text_join_mutator"
}`
    };
    
    setJsonInput(examples[example]);
    setTimeout(updateBlock, 100);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">JSON to Blockly Block Viewer</h1>
        <p className="text-sm text-blue-100 mt-1">Paste your block definition JSON to see it rendered</p>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - JSON input */}
        <div className="w-1/2 flex flex-col border-r border-gray-300 bg-white">
          <div className="p-4 border-b border-gray-200 bg-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-gray-700">Block Definition (JSON)</label>
              <button
                onClick={handleUpdateClick}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Update Block
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadExample('simple')}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Simple
              </button>
              <button
                onClick={() => loadExample('dropdown')}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Control
              </button>
              <button
                onClick={() => loadExample('complex')}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Complex
              </button>
            </div>
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
            placeholder="Paste your JSON block definition here..."
            spellCheck={false}
          />
          
          {error && (
            <div className="p-4 bg-red-50 border-t border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
        
        {/* Right panel - Blockly workspace */}
        <div className="w-1/2 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200 bg-gray-100">
            <label className="font-semibold text-gray-700">Block Preview</label>
            <p className="text-xs text-gray-600 mt-1">Use mouse wheel to zoom, drag to pan</p>
          </div>
          <div ref={blocklyDiv} className="flex-1"></div>
        </div>
      </div>
    </div>
  );
};

export default Playground;