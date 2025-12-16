import { useEffect, useRef, useState } from 'react'
import * as Blockly from 'blockly';
import { AlertCircle } from 'lucide-react';

const BlocklyPreview = ({ definition }) => {
  const workspaceRef = useRef(null);
  const blocklyDivRef = useRef(null);
  const [error, setError] = useState(null);
  const blockTypeRef = useRef(null);

  useEffect(() => {
    if (!blocklyDivRef.current) return;

    try {
      workspaceRef.current = Blockly.inject(blocklyDivRef.current, {
        readOnly: true,
        renderer: 'zelos',
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
    } catch (err) {
      setError('Failed to initialize Blockly workspace');
    }

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  // Update block when definition changes
  useEffect(() => {
    if (!workspaceRef.current) return;

    try {
      // Parse the definition
      const blockDef = typeof definition === 'string' ? JSON.parse(definition) : definition;
      
      if (!blockDef.type) {
        setError('Block definition must have a "type" property');
        return;
      }

      // Clear any existing error
      setError(null);

      // Clear workspace
      workspaceRef.current.clear();

      // Unregister previous block type if it exists
      if (blockTypeRef.current && Blockly.Blocks[blockTypeRef.current]) {
        delete Blockly.Blocks[blockTypeRef.current];
      }

      // Register the new block type
      blockTypeRef.current = blockDef.type;
      Blockly.Blocks[blockDef.type] = {
        init: function() {
          this.jsonInit(blockDef);
        }
      };

      // Create and render the block
      const block = workspaceRef.current.newBlock(blockDef.type);
      block.initSvg();
      block.render();
      block.moveBy(50, 50);

    } catch (err) {
      setError(err.message);
      if (workspaceRef.current) {
        workspaceRef.current.clear();
      }
    }
  }, [definition]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg border-2 border-red-200 p-4">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="font-medium text-red-700 mb-1">Invalid Block Definition</div>
          <div className="text-xs text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={blocklyDivRef} className="h-96 bg-white rounded-lg border-2 border-gray-300" style={{ minHeight: '384px' }}/>
  );
};

export default BlocklyPreview