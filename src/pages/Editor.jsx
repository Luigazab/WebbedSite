import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { defineBlocks } from '../blocks/defineBlocks';
import { defineGenerators } from  '../blocks/defineGenerators';
import { useEffect, useRef, useState } from 'react';
import { javascriptGenerator } from 'blockly/javascript';

const Editor = () => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if(!isInitialized) {
      defineBlocks();
      defineGenerators();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current && isInitialized){
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: {
          kind: 'categoryToolbox',
          contents:[{
            kind: 'category',
            name: 'Structure',
            colour:230,
            contents:[
              {kind: 'block', type: 'html_boilerplate'},
              {kind: 'block', type: 'html_title'},
              {kind: 'block', type: 'html_style'},
            ]
          },
          {
            kind: 'category',
            name: 'Elements',
            colour:160,
            contents:[
              {kind: 'block', type: 'html_element'},
              {kind: 'block', type: 'html_text'},
            ]
          },
          {
            kind: 'category',
            name: 'CSS',
            colour:290,
            contents:[
              {kind: 'block', type: 'css_rule'},
              {kind: 'block', type: 'css_property'},
            ]
          }]
        },
        zoom: {
          controls: true,
          wheel: true,
          startScale:1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2
        },
        trashcan: true
      });

      runCode();
    }

    return () => {
      if (workspace.current) {
        workspace.current.dispose();
        workspace.current = null;
      }
    };
  }, [isInitialized]);

  const runCode = () => {
    if (workspace.current){
      const code = javascriptGenerator.workspaceToCode(workspace.current);
      setGeneratedCode(code);
    }
  };

  return <div className="flex flex-col w-full h-full space-y-2 p-6 rounded-lg">
    <h2 className="font-bold text-4xl text-left">WebbedSite <span className="text-green-700">Editor</span></h2>
    <div className="flex flex-1 overflow-hidden bg-amber-100 rounded-2xl border-2">
      <div ref={blocklyDiv} className="flex-1"/>
      <div id="outputPanel" className="w-2/5 flex flex-col border-l-4 border-gray-300 bg-white">
        <div id="controls" className="p-4 bg-gray-50 border-b border-gray-200 flex gap-3">
          <button onClick={runCode} className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium">Run Code</button>
          <button onClick={() => {runCode(); setActiveTab('code');}} className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">View Source Code</button>
        </div>
        <div className="flex px-4 bg-gray-50 border-b border-gray-200">
          <button onClick={() => setActiveTab('preview')}className={`px-5 py-2 font-medium border-b-4 ${
              activeTab === 'preview'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-gray-600'
              }`}>Preview
          </button>
            <button onClick={() => setActiveTab('code')}className={`px-5 py-2 font-medium border-b-4 ${
              activeTab === 'code'
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-gray-600'
              }`}>Code
            </button>
        </div>
        <div className="flex-1 overflow-auto">
          {activeTab === 'preview' ? (
            <iframe srcDoc={generatedCode} className="w-full h-full border-0" title="preview" sandbox="allow-scripts"/>
          ) : (
            <pre className="p-4 bg-gray-100 text-sm h-full overflow-auto font-mono">{generatedCode}</pre>
          )}
        </div>
      </div>
    </div>
  </div>;
};

export default Editor;
