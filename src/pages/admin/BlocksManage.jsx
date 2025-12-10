import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from "../../supabaseClient";

// --- Utility Functions (Place outside the component or import them) ---

const flattenInputs = (inputs) => {
    return inputs.map(input => {
        const base = {
            id: input.id,
            type: input.input_type,
            name: input.name,
            check: input.check_type,
            order: input.input_order,
        };
        return { ...base, ...(input.field_config || {}) };
    }).sort((a, b) => a.order - b.order);
};

const prepareDataForDb = (blockData, inputData, blockId) => {
    const newBlockData = {
        block_name: blockData.block_name,
        block_type: blockData.block_type,
        category: blockData.category,
        colour: blockData.colour,
        message0: blockData.message0, // Renamed from 'message'
        inputsInline: blockData.inputsInline,
        tooltip: blockData.tooltip,
        help_url: blockData.help_url,
        previousStatement: blockData.previousStatement || null,
        nextStatement: blockData.nextStatement || null,
        output: blockData.output || null,
        code_template: blockData.code_template,
    };

    const newInputsData = inputData.map((input, index) => {
        const { type, name, check, id, order, ...fieldConfig } = input;
        
        const isField = type.startsWith('field_');
        const isConnection = type.startsWith('input_');
        
        const configToSave = Object.keys(fieldConfig).length > 0 ? fieldConfig : null;

        return {
            block_id: blockId,
            input_order: index + 1,
            input_type: type,
            name: (isConnection || isField) ? (name || null) : null,
            check_type: (type === 'input_value' || type === 'input_statement') ? (check || null) : null,
            field_config: configToSave,
        };
    });

    return { block: newBlockData, inputs: newInputsData };
};

// --- BlocksManage Component ---

const BlocksManage = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [message, setMessage] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    
    // Combined form state for the main block table
    const [formData, setFormData] = useState({
        block_name: '',
        block_type: 'html',
        category: '',
        tooltip: '',
        help_url: '',
        colour: '#5C81A6',
        message0: '', // New name
        code_template: '',
        previousStatement: null,
        nextStatement: null,
        output: null, // Value output
        inputsInline: false,
    });

    // Separate state for the dynamic args0 array
    const [blockInputs, setBlockInputs] = useState([]);
    
    // State for adding a new input
    const [newBlockInput, setNewBlockInput] = useState({
        type: 'field_input',
        name: '',
        check: null,
        text: '', // Default for field_input
    });

    useEffect(() => {
        loadBlocks();
    }, []);

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const loadBlocks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .order('category', { ascending: true });

    if (error) {
      showMessage('Error: ' + error.message, true);
    } else {
      // We need to unpack the JSON 'definition' back into the flat UI state for editing
      const transformedBlocks = data.map(b => {
        const def = b.definition;
        return {
           id: b.id,
           block_name: b.block_name,
           block_type: b.block_type,
           category: b.category,
           code_template: b.code_template,
           // Unpack JSON definition back to UI fields
           colour: def.colour,
           message0: def.message0,
           tooltip: def.tooltip,
           inputsInline: def.inputsInline,
           previousStatement: !!def.previousStatement,
           previous_check: typeof def.previousStatement === 'string' ? def.previousStatement : null,
           nextStatement: !!def.nextStatement,
           next_check: typeof def.nextStatement === 'string' ? def.nextStatement : null,
           output: !!def.output,
           output_check: typeof def.output === 'string' ? def.output : null,
           // args0 maps to our blockInputs state
           args0: def.args0 || []
        };
      });
      setBlocks(transformedBlocks);
    }
    setLoading(false);
  };

    const handleCreate = () => {
        setEditingBlock(null);
        setFormData({
            block_name: '',
            block_type: 'html',
            category: '',
            tooltip: '',
            help_url: '',
            colour: '#5C81A6',
            message0: '',
            code_template: '',
            previousStatement: 'html_element',
            nextStatement: 'html_element',
            output: null,
            inputsInline: false,
        });
        setBlockInputs([]); // Start with no inputs
        setShowModal(true);
    };

    const handleEdit = (block) => {
        setEditingBlock(block);
        setFormData({
            block_name: block.block_name,
            block_type: block.block_type,
            category: block.category,
            tooltip: block.tooltip || '',
            help_url: block.help_url || '',
            colour: block.colour || '#5C81A6',
            message0: block.message0 || '',
            code_template: block.code_template || '',
            previousStatement: block.previousStatement,
            nextStatement: block.nextStatement,
            output: block.output,
            inputsInline: block.inputsInline,
        });
        setBlockInputs(block.block_inputs); // Load existing inputs
        setShowModal(true);
    };

    const handleDelete = async (id, blockName) => {
        if (!window.confirm(`Delete block "${blockName}"? This will also delete all associated inputs.`)) return;

        // Supabase CASCADE delete handles 'block_inputs' automatically
        const { error } = await supabase
            .from('blocks')
            .delete()
            .eq('id', id);

        if (error) {
            showMessage('Error deleting block: ' + error.message);
        } else {
            showMessage('Block deleted successfully');
            loadBlocks();
        }
    };
    
    // **KEY FUNCTION CHANGE**
    const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct the Blockly JSON Definition Object
    const blocklyDefinition = {
      type: formData.block_name, // standard blockly property
      message0: formData.message0,
      args0: blockInputs.map(input => {
        // Clean up input object to remove UI-specific IDs or empty fields
        const { id, text, options, ...rest } = input;
        
        // Add field specific properties back if they exist
        const cleanInput = { ...rest };
        if (input.type === 'field_input') cleanInput.text = text;
        if (input.type === 'field_dropdown') cleanInput.options = typeof options === 'string' ? JSON.parse(options) : options;
        if (input.type === 'field_colour') cleanInput.colour = text; // assuming text holds the hex
        
        return cleanInput;
      }),
      colour: formData.colour,
      tooltip: formData.tooltip,
      helpUrl: formData.help_url,
      inputsInline: formData.inputsInline,
    };

    // Add Connections only if they are enabled
    if (formData.previousStatement) {
      blocklyDefinition.previousStatement = formData.previous_check || null;
    }
    if (formData.nextStatement) {
      blocklyDefinition.nextStatement = formData.next_check || null;
    }
    if (formData.output) {
      blocklyDefinition.output = formData.output_check || null;
    }

    // Prepare payload for Supabase
    const dbPayload = {
      block_name: formData.block_name,
      block_type: formData.block_type,
      category: formData.category,
      code_template: formData.code_template,
      definition: blocklyDefinition // <--- The JSON Column
    };

    let result;
    if (editingBlock) {
      result = await supabase.from('blocks').update(dbPayload).eq('id', editingBlock.id);
    } else {
      result = await supabase.from('blocks').insert([dbPayload]);
    }

    if (result.error) {
      showMessage('Error: ' + result.error.message);
    } else {
      showMessage('Saved successfully!');
      setShowModal(false);
      loadBlocks();
    }
  };
    
    // --- Input Management Functions ---

    const addNewBlockInput = () => {
        if (newBlockInput.type.startsWith('field_') && !newBlockInput.name) {
            showMessage('Field name is required for fields.');
            return;
        }
        if ((newBlockInput.type === 'input_value' || newBlockInput.type === 'input_statement') && !newBlockInput.name) {
            showMessage('Input name is required for value/statement inputs.');
            return;
        }

        const newInput = { ...newBlockInput };
        
        // Dynamic field handling for field_dropdown
        if (newInput.type === 'field_dropdown' && typeof newInput.options === 'string') {
            try {
                // Parse options from a string like: [['Text 1', 'value1'], ['Text 2', 'value2']]
                newInput.options = JSON.parse(newInput.options);
            } catch (e) {
                showMessage('Dropdown options must be valid JSON array of arrays (e.g., [["Text","value"],...])');
                return;
            }
        }
        
        setBlockInputs([
            ...blockInputs,
            newInput
        ]);

        // Reset the new input form
        setNewBlockInput({ type: 'field_input', name: '', check: null, text: '' });
    };

    const removeBlockInput = (index) => {
        setBlockInputs(blockInputs.filter((_, i) => i !== index));
    };


    const categories = [...new Set(blocks.map(b => b.category))];
    const filteredBlocks = blocks.filter(block => {
        const matchesSearch = block.block_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            block.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || block.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    // --- Component JSX (Admin Dashboard UI) ---
    return (
        <div className="space-y-6">
            {/* Message Bar */}
            {message && (
                <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
                    {message}
                </div>
            )}
            
            {/* Top Controls (Search, Filter, New Block) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                {/* ... (Search and Filter UI - Keep as is) ... */}
                <div className="flex-1 w-full sm:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search blocks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        New Block
                    </button>
                </div>
            </div>

            {/* Block List */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading blocks...</div>
            ) : filteredBlocks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No blocks found</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBlocks.map((block) => (
                        <div key={block.id} className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: block.colour }}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg">{block.block_name}</h3>
                                    <span className="text-sm text-gray-500">{block.category}</span>
                                </div>
                                <span className="px-2 py-1 text-xs rounded" style={{ backgroundColor: block.colour, color: '#fff' }}>
                                    {block.block_type.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{block.tooltip || 'No description'}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(block)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(block.id, block.block_name)}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Create/Edit Block */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
                            <h2 className="text-2xl font-bold">
                                {editingBlock ? 'Edit Block' : 'Create New Block'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Block Name *</label>
                                    <input
                                        type="text"
                                        value={formData.block_name}
                                        onChange={(e) => setFormData({ ...formData, block_name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="html_custom_block"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Block Type *</label>
                                    <select
                                        value={formData.block_type}
                                        onChange={(e) => setFormData({ ...formData, block_type: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="html">HTML</option>
                                        <option value="css">CSS</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Category *</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Layout, Text, etc."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Color</label>
                                    <input
                                        type="color"
                                        value={formData.colour}
                                        onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                                        className="w-full h-10 px-3 py-1 border rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Tooltip</label>
                                <input
                                    type="text"
                                    value={formData.tooltip}
                                    onChange={(e) => setFormData({ ...formData, tooltip: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Description of what this block does"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Message0 * (use %1, %2 for field/input positions)</label>
                                <input
                                    type="text"
                                    value={formData.message0}
                                    onChange={(e) => setFormData({ ...formData, message0: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="div attrs: %1 content: %2"
                                    required
                                />
                            </div>
                            
                            {/* NEW: Block Inputs (The args0 array) */}
                            <div className="border rounded-lg p-4">
                                <h3 className="font-semibold mb-3">Block Inputs/Fields (args0 array)</h3>

                                {blockInputs.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        {blockInputs.map((input, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                                                <span className="flex-1 text-sm">
                                                    <strong>{index + 1}.</strong> 
                                                    <span className="font-mono text-blue-600 mx-1">({input.type})</span>
                                                    {input.name && <span className="font-bold">{input.name}</span>}
                                                    {input.check && ` (Check: ${input.check})`}
                                                    {input.text && ` - Default: "${input.text}"`}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeBlockInput(index)}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <select
                                        value={newBlockInput.type}
                                        onChange={(e) => setNewBlockInput({ 
                                            type: e.target.value, 
                                            name: '', 
                                            check: null, 
                                            text: e.target.value.startsWith('field_') ? (e.target.value === 'field_colour' ? '#000000' : '') : null, 
                                            options: e.target.value === 'field_dropdown' ? '[["Option 1", "val1"], ["Option 2", "val2"]]' : undefined 
                                        })}
                                        className="px-3 py-2 border rounded-lg col-span-1"
                                    >
                                        <option value="field_input">Field: Text Input</option>
                                        <option value="field_dropdown">Field: Dropdown</option>
                                        <option value="field_number">Field: Number</option>
                                        <option value="field_colour">Field: Color Picker</option>
                                        <option value="field_checkbox">Field: Checkbox</option>
                                        <option value="input_value">Input: Value</option>
                                        <option value="input_statement">Input: Statement</option>
                                        <option value="input_dummy">Input: Dummy</option>
                                        <option value="input_end_row">Input: End Row</option>
                                    </select>
                                    
                                    {(newBlockInput.type !== 'input_dummy' && newBlockInput.type !== 'input_end_row') && (
                                        <input
                                            type="text"
                                            value={newBlockInput.name || ''}
                                            onChange={(e) => setNewBlockInput({ ...newBlockInput, name: e.target.value })}
                                            placeholder="Input/Field Name (e.g., ATTRS, CONTENT)"
                                            className="px-3 py-2 border rounded-lg col-span-1"
                                        />
                                    )}

                                    {(newBlockInput.type === 'input_value' || newBlockInput.type === 'input_statement') && (
                                        <input
                                            type="text"
                                            value={newBlockInput.check || ''}
                                            onChange={(e) => setNewBlockInput({ ...newBlockInput, check: e.target.value })}
                                            placeholder="Check Type (e.g., attribute, html)"
                                            className="px-3 py-2 border rounded-lg col-span-1"
                                        />
                                    )}

                                    {/* Conditional Field Configuration */}
                                    {newBlockInput.type === 'field_input' && (
                                        <input
                                            type="text"
                                            value={newBlockInput.text || ''}
                                            onChange={(e) => setNewBlockInput({ ...newBlockInput, text: e.target.value })}
                                            placeholder="Default Text"
                                            className="px-3 py-2 border rounded-lg"
                                        />
                                    )}
                                    {newBlockInput.type === 'field_dropdown' && (
                                        <input
                                            type="text"
                                            value={newBlockInput.options || ''}
                                            onChange={(e) => setNewBlockInput({ ...newBlockInput, options: e.target.value })}
                                            placeholder='Dropdown Options JSON: [["Text","value"]]'
                                            className="px-3 py-2 border rounded-lg col-span-2"
                                        />
                                    )}
                                    {/* Add other field types (number, colour) handling here if needed */}
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={addNewBlockInput}
                                    className="mt-2 w-full px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                                >
                                    Add Block Input/Field
                                </button>
                            </div>


                            {/* Code Template - Keep as is */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Code Template * (use {'{FIELD_NAME}'} for fields, {'{INPUT_NAME}'} for inputs)
                                </label>
                                <textarea
                                    value={formData.code_template}
                                    onChange={(e) => setFormData({ ...formData, code_template: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500"
                                    rows={6}
                                    placeholder={'<div class="{ATTRS}">{CONTENT}</div>'}
                                    required
                                />
                            </div>

                            {/* Advanced Options (Connections) - Simplified */}
                            <div className="border rounded-lg p-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="flex items-center gap-2 font-semibold mb-3"
                                >
                                    {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    Advanced Options (Connections)
                                </button>
                                
                                {showAdvanced && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            {/* Previous/Next Statement & Inline Inputs */}
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={!!formData.previousStatement}
                                                    onChange={(e) => setFormData({ ...formData, previousStatement: e.target.checked ? 'html_element' : null })}
                                                    className="w-4 h-4"
                                                />
                                                Previous Statement
                                            </label>
                                            
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={!!formData.nextStatement}
                                                    onChange={(e) => setFormData({ ...formData, nextStatement: e.target.checked ? 'html_element' : null })}
                                                    className="w-4 h-4"
                                                />
                                                Next Statement
                                            </label>
                                            
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.inputsInline}
                                                    onChange={(e) => setFormData({ ...formData, inputsInline: e.target.checked })}
                                                    className="w-4 h-4"
                                                />
                                                Inline Inputs
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Statement Check (Previous/Next)</label>
                                                <input
                                                    type="text"
                                                    value={formData.previousStatement || ''}
                                                    onChange={(e) => setFormData({ ...formData, previousStatement: e.target.value || null, nextStatement: e.target.value || null })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="e.g., html_element (or leave empty)"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Value Output Check</label>
                                                <input
                                                    type="text"
                                                    value={formData.output || ''}
                                                    onChange={(e) => setFormData({ ...formData, output: e.target.value || null })}
                                                    className="w-full px-3 py-2 border rounded-lg"
                                                    placeholder="e.g., attribute (or leave empty)"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <Save size={20} />
                                    {editingBlock ? 'Update Block' : 'Create Block'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlocksManage;