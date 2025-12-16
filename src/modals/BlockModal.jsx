import { useEffect, useState } from "react";
import BlocklyPreview from "../components/BlocklyPreview";
import { Eye, X } from "lucide-react";


const BlockModal = ({ isOpen, onClose, block, onSave, categories }) => {
  const [formData, setFormData] = useState({
    block_name: "",
    block_type: "html",
    category: "",
    definition: "{}",
    code_template: "",
    colour: "#3b82f6",
  });

  useEffect(() => {
    if (block) {
      setFormData({
        block_name: block.block_name || "",
        block_type: block.block_type || "html",
        category: block.category || "",
        definition:
          typeof block.definition === "string"
            ? block.definition
            : JSON.stringify(block.definition, null, 2),
        code_template: block.code_template || "",
        colour: block.colour || "#3b82f6",
      });
    } else {
      // Reset for new block
      setFormData({
        block_name: "",
        block_type: "html",
        category: categories[0] || "",
        definition: JSON.stringify(
          {
            type: "new_block",
            message0: "new block %1",
            args0: [{ type: "field_input", name: "TEXT", text: "default" }],
            previousStatement: null,
            nextStatement: null,
            colour: 230,
            tooltip: "A new block",
            helpUrl: "",
          },
          null,
          2
        ),
        code_template: "",
        colour: "#3b82f6",
      });
    }
  }, [block, isOpen, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {block ? "Edit Block" : "Create New Block"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block Name
                </label>
                <input type="text" value={formData.block_name} 
                  onChange={(e) => setFormData({ ...formData, block_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block Type
                </label>
                <select value={formData.block_type}
                  onChange={(e) => setFormData({ ...formData, block_type: e.target.value }) }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value }) }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colour
                </label>
                <div className="flex gap-2">
                  <input type="color" value={formData.colour}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value }) }
                    className="w-16 h-10 rounded border border-gray-300 cursor-pointer"/>
                  <input type="text" value={formData.colour}
                    onChange={(e) => setFormData({ ...formData, colour: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                </div>
              </div>
            </div>

            {/* Definition and Preview */}
            <div  className="grid grid-cols-1 lg:grid-cols-2 gap-4"> 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Block Definition (JSON)
                </label>
                {/* JSON Editor */}
                <div>
                  <textarea value={formData.definition}
                    onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                    className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                    placeholder='{"type": "block_name", "message0": "block %1"}' required />
                  <p className="mt-2 text-xs text-gray-500">
                    Edit the JSON definition to see the block preview update in
                    real-time
                  </p>
                </div>

                {/* Preview */}
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Block Output
                  </label>
                  <BlocklyPreview definition={formData.definition} />
                </div>
            </div>

            {/* Code Template */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code Template
              </label>
              <textarea value={formData.code_template}
                onChange={(e) => setFormData({ ...formData, code_template: e.target.value }) }
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="<div>...</div>"required/>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
              {block ? "Update Block" : "Create Block"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default BlockModal;
