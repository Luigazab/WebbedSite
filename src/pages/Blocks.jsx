import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Code, Palette } from 'lucide-react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import Theme from '@blockly/theme-modern';
import { Divider } from '../components/Divider';
import * as BlocklyFieldColour from '@blockly/field-colour';

if (!Blockly.registry.getClass(Blockly.registry.Type.FIELD, 'field_colour')) {
  BlocklyFieldColour.registerFieldColour();
}

const Blocks = () => {
  // 1. Initialize with 'html'
  const [activeTab, setActiveTab] = useState('html'); 
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [blocksRegistered, setBlocksRegistered] = useState(false);
  
  const blockPreviewRefs = useRef({});
  const detailPreviewRef = useRef(null);
  const workspaceRefs = useRef({}); 
  const detailWorkspaceRef = useRef(null);

  // FIX: Move isHTMLBlock UP here so loadBlocks can use it
  const isHTMLBlock = (block) => {
    return block.block_type === 'html' || 
           (!block.definition?.colour?.includes('#29') && 
           !block.definition?.colour?.includes('#2e') &&
           !block.category?.toLowerCase().includes('color') &&
           !block.category?.toLowerCase().includes('text styling') &&
           !block.category?.toLowerCase().includes('box model') &&
           !block.category?.toLowerCase().includes('layout') &&
           !block.category?.toLowerCase().includes('flexbox') &&
           !block.category?.toLowerCase().includes('effects') &&
           block.category !== 'Styling');
  };

  useEffect(() => {
    loadBlocks();
    return () => {
      Object.values(workspaceRefs.current).forEach(ws => ws.dispose());
      if (detailWorkspaceRef.current) detailWorkspaceRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (blocks.length > 0 && !blocksRegistered) {
      registerAllBlocks();
      setBlocksRegistered(true);
    }
  }, [blocks, blocksRegistered]);

  useEffect(() => {
    if (blocksRegistered) {
      Object.values(workspaceRefs.current).forEach(ws => ws.dispose());
      workspaceRefs.current = {};
      const timer = setTimeout(() => renderBlockPreviews(), 0);
      return () => clearTimeout(timer);
    }
  }, [blocksRegistered, activeTab]);

  useEffect(() => {
    if (selectedBlock) {
      if (detailWorkspaceRef.current) {
        detailWorkspaceRef.current.dispose();
        detailWorkspaceRef.current = null;
      }
      const timer = setTimeout(() => renderDetailPreview(), 0);
      return () => clearTimeout(timer);
    }
  }, [selectedBlock]);

  const loadBlocks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .order('category', { ascending: true });

    if (!error && data) {
      setBlocks(data);
      
      // FIX: Filter specifically for HTML blocks to find the initial selection
      // This prevents the tab from switching to CSS automatically
      const initialHtmlBlocks = data.filter(b => isHTMLBlock(b));
      
      if (initialHtmlBlocks.length > 0) {
        setSelectedBlock(initialHtmlBlocks[0]);
      } else if (data.length > 0) {
        // Fallback: only if no HTML blocks exist, take the first available
        setSelectedBlock(data[0]);
      }
      
      // FIX: Removed "setActiveTab(firstBlock.block_type)"
      // We want to stay on the default 'html' tab initialized in useState
    }
    setLoading(false);
  };

  const registerAllBlocks = () => {
    const jsonDefinitions = blocks.map(b => b.definition);
    const newDefinitions = jsonDefinitions.filter(def => {
      return def && def.type && !Blockly.Blocks[def.type]; 
    });

    if (newDefinitions.length > 0) {
      Blockly.defineBlocksWithJsonArray(newDefinitions);
    }
  };

  const renderBlockPreviews = () => {
    const currentBlocks = blocks.filter(b => b.block_type === activeTab);

    currentBlocks.forEach(block => {
      const container = blockPreviewRefs.current[block.id];
      if (!container || !block.definition?.type) return;

      container.innerHTML = '';

      try {
        const workspace = Blockly.inject(container, {
          readOnly: true,
          theme: Theme,
          renderer: "zelos",
          zoom: { controls: false, wheel: false, startScale: 0.8 },
          move: { scrollbars: false, drag: false, wheel: false },
          sounds: false, 
        });

        workspaceRefs.current[block.id] = workspace;

        const blockType = block.definition.type;
        const blockXml = `<xml><block type="${blockType}"></block></xml>`;
        
        Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(blockXml), workspace);
        workspace.zoomToFit(); 
        
      } catch (error) {
        console.error(`Error rendering block ${block.block_name}:`, error);
      }
    });
  };

  const renderDetailPreview = () => {
    const container = detailPreviewRef.current;
    if (!container || !selectedBlock || !selectedBlock.definition?.type) return;

    container.innerHTML = '';

    try {
      const workspace = Blockly.inject(container, {
        readOnly: true,
        theme: Theme,
        renderer: "zelos",
        zoom: { controls: false, wheel: false, startScale: 1.0 },
        move: { scrollbars: false, drag: false, wheel: false },
        sounds: false,
      });

      detailWorkspaceRef.current = workspace;

      const blockType = selectedBlock.definition.type;
      const blockXml = `<xml><block type="${blockType}"></block></xml>`;
      
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(blockXml), workspace);
      workspace.zoomToFit();

    } catch (error) {
      console.error(`Error rendering detail block ${selectedBlock.block_name}:`, error);
    }
  };

  // Helper vars for render
  const htmlBlocks = blocks.filter(b => isHTMLBlock(b));
  const cssBlocks = blocks.filter(b => !isHTMLBlock(b));
  const currentBlocks = activeTab === 'html' ? htmlBlocks : cssBlocks;

  const groupedBlocks = currentBlocks.reduce((acc, block) => {
    if (!acc[block.category]) acc[block.category] = [];
    acc[block.category].push(block);
    return acc;
  }, {});

  const getFieldInputs = (block) => {
    const args = block.definition?.args0 || [];
    return args.filter(arg => 
      ['field_input', 'field_dropdown', 'field_colour', 'field_number', 'field_checkbox'].includes(arg.type)
    );
  };

  const getStatementInputs = (block) => {
    const template = block.code_template || '';
    const statementInputs = [];
    if (template.includes('{CONTENT}')) statementInputs.push({ name: 'CONTENT', check: 'body_element' });
    if (template.includes('{HEAD}')) statementInputs.push({ name: 'HEAD', check: 'head_element' });
    if (template.includes('{BODY}')) statementInputs.push({ name: 'BODY', check: 'body_element' });
    if (template.includes('{CSS}')) statementInputs.push({ name: 'CSS', check: 'css_element' });
    if (template.includes('{PROPERTIES}')) statementInputs.push({ name: 'PROPERTIES', check: 'css_property' });
    if (template.includes('{ITEMS}')) statementInputs.push({ name: 'ITEMS', check: 'list_item' });
    return statementInputs;
  };

  const renderArgDetails = (arg) => {
    const typeLabels = {
      field_input: 'Text Field',
      field_dropdown: 'Dropdown',
      field_colour: 'Color Picker',
      field_number: 'Number Field',
      field_checkbox: 'Checkbox'
    };

    const displayType = typeLabels[arg.type] || arg.type;
    
    let defaultValue = null;
    if (arg.type === 'field_input') defaultValue = arg.text;
    else if (arg.type === 'field_colour') defaultValue = arg.colour;
    else if (arg.type === 'field_number') defaultValue = arg.value;
    else if (arg.type === 'field_checkbox') defaultValue = arg.checked ? 'checked' : 'unchecked';
    else if (arg.type === 'field_dropdown' && arg.options) defaultValue = arg.options[0]?.[0];

    return (
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">{arg.name}</div>
          <div className="text-xs text-gray-500">{displayType}</div>
        </div>
        {defaultValue && (
          <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
            {arg.type === 'field_colour' ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border" style={{ backgroundColor: defaultValue }}></div>
                <span>{defaultValue}</span>
              </div>
            ) : (
              <span>Default: "{defaultValue}"</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const fieldInputs = selectedBlock ? getFieldInputs(selectedBlock) : [];
  const statementInputs = selectedBlock ? getStatementInputs(selectedBlock) : [];

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="w-full pt-12 text-center">
          <h1 className="font-bold text-4xl text-slate-900">Blocks</h1>
          <p className="text-gray-600 mt-1 text-xl font-medium">Explore HTML and CSS with us!</p>
        </div>
      </div>

      <div className="bg-slate-200/50 flex justify-between space-x-2 flex-col gap-2">
        {/* Tabs */}
        <div className="bg-white shadow-b-sm sticky top-0 z-1">
          <div className="translate-y-20">
            <Divider/>
          </div>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1">
              <button
                onClick={() => {
                  setActiveTab('html');
                  const firstHtmlBlock = htmlBlocks[0];
                  if (firstHtmlBlock) setSelectedBlock(firstHtmlBlock);
                }}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-4 transition-colors ${
                  activeTab === 'html'
                    ? 'border-orange-500 text-white bg-orange-500 rounded-t-lg'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Code size={20} />
                HTML Blocks
                <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                  {htmlBlocks.length}
                </span>
              </button>
              <button onClick={() => {
                setActiveTab('css');
                const firstCssBlock = cssBlocks[0];
                if (firstCssBlock) setSelectedBlock(firstCssBlock);
              }}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-4 transition-colors ${
                  activeTab === 'css'
                    ? 'border-blue-500 text-white bg-blue-500 rounded-t-lg'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}>
                <Palette size={20} />
                CSS Blocks
                <span className="ml-1 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                  {cssBlocks.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading blocks...</p>
            </div>
          ) : currentBlocks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">No {activeTab.toUpperCase()} blocks available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Block List */}
              <div className="space-y-6">
                {Object.entries(groupedBlocks).map(([category, categoryBlocks]) => (
                  <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-linear-to-r from-gray-800 to-gray-700 px-4 py-3">
                      <h3 className="text-lg font-bold text-white">{category}</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {categoryBlocks.map((block) => (
                        <div
                          key={block.id}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            selectedBlock?.id === block.id
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                          onClick={() => setSelectedBlock(block)}
                        >
                          <div className="text-sm font-semibold text-gray-700 mb-2">
                            {block.block_name}
                          </div>
                          <div 
                            ref={el => {
                              if (el) blockPreviewRefs.current[block.id] = el;
                            }}
                            id={`preview-${block.id}`}
                            style={{ height: '80px', width: '100%' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column - Block Details */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                {selectedBlock ? (
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div 
                      className="px-6 py-4 text-white"
                      style={{ backgroundColor: selectedBlock.definition?.colour || '#5b67a5' }}
                    >
                      <h2 className="text-2xl font-bold">{selectedBlock.block_name}</h2>
                      <p className="text-sm opacity-90 mt-1">{selectedBlock.category}</p>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Description */}
                      {selectedBlock.definition?.tooltip && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Description
                          </h3>
                          <p className="text-gray-600">{selectedBlock.definition.tooltip}</p>
                        </div>
                      )}

                      {/* Block Preview */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          Block Preview
                        </h3>
                        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden">
                          <div 
                            ref={detailPreviewRef}
                            style={{ height: '120px', width: '100%' }}
                          />
                        </div>
                      </div>

                      {/* Fields */}
                      {fieldInputs.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Field Inputs ({fieldInputs.length})
                          </h3>
                          <div className="space-y-2">
                            {fieldInputs.map((arg, index) => (
                              <div key={index}>
                                {renderArgDetails(arg)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Statement Inputs */}
                      {statementInputs.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Statement Inputs (Nesting)
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {statementInputs.map((input, index) => (
                              <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                {input.name}
                                <span className="text-xs ml-1 opacity-75">({input.check})</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Code Output */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          Generated Code Template
                        </h3>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                          <pre className="text-sm font-mono whitespace-pre-wrap">
                            {selectedBlock.code_template}
                          </pre>
                        </div>
                      </div>

                      {/* Properties */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                          Connection Properties
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`w-3 h-3 rounded-full ${
                              selectedBlock.definition?.previousStatement !== null && selectedBlock.definition?.previousStatement !== undefined ? 'bg-green-500' : 'bg-gray-300'
                            }`}></span> 
                            <span className="text-gray-600">Previous Connection</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`w-3 h-3 rounded-full ${
                              selectedBlock.definition?.nextStatement !== null && selectedBlock.definition?.nextStatement !== undefined ? 'bg-green-500' : 'bg-gray-300'
                            }`}></span> 
                            <span className="text-gray-600">Next Connection</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`w-3 h-3 rounded-full ${
                              selectedBlock.definition?.inputsInline ? 'bg-green-500' : 'bg-gray-300'
                            }`}></span> 
                            <span className="text-gray-600">Inline Inputs</span>
                          </div>
                        </div>
                      </div>

                      {/* Help Link */}
                      {selectedBlock.definition?.helpUrl && (
                        <div>
                          <a
                            href={selectedBlock.definition.helpUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Learn More →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
                    Select a block to view details
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blocks;