import { useState, useEffect } from "react";
import { Search, Tag, Code, FileText, Plus } from "lucide-react";
import { supabase } from "../../supabaseClient";
import BlockModal from "../../modals/BlockModal";

export default function BlocksManage() {
  const [blocks, setBlocks] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const fetchBlocks = async () => {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (data) {
    setBlocks(data);
    setFilteredBlocks(data);
    const uniqueCategories = [...new Set(data.map(b => b.category))];
    setCategories(uniqueCategories);
  }
};

  useEffect(() => {
    fetchBlocks();
  }, []);

  useEffect(() => {
    let filtered = blocks;

    // Filter by tab
    if (activeTab === "html") {
      filtered = filtered.filter((b) => b.block_type === "html");
    } else if (activeTab === "css") {
      filtered = filtered.filter((b) => b.block_type === "css");
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.block_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((b) => b.category === selectedCategory);
    }

    setFilteredBlocks(filtered);
  }, [activeTab, searchQuery, selectedCategory, blocks]);

  const handleEdit = (block) => {
    setSelectedBlock(block);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedBlock(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedBlock) {
        // Update existing block
        const { error } = await supabase
          .from("blocks")
          .update({
            ...formData,
            definition: JSON.parse(formData.definition),
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedBlock.id);

        if (!error) {
          // Refresh blocks list
          fetchBlocks();
        }
      } else {
        // Create new block
        const { error } = await supabase.from("blocks").insert({
          ...formData,
          definition: JSON.parse(formData.definition),
        });

        if (!error) {
          fetchBlocks();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const getBlockIcon = (type) => {
    return type === "html" ? (
      <FileText className="w-5 h-5" />
    ) : (
      <Code className="w-5 h-5" />
    );
  };

  return (
    <div>
      <div>
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Block Management
            </h1>
            <p className="text-gray-600">
              Manage and preview all your HTML and CSS blocks
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create New Block
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: "all", label: "All Blocks", count: blocks.length },
                {
                  id: "html",
                  label: "HTML Blocks",
                  count: blocks.filter((b) => b.block_type === "html").length,
                },
                {
                  id: "css",
                  label: "CSS Blocks",
                  count: blocks.filter((b) => b.block_type === "css").length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="p-6 flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredBlocks.length} block
          {filteredBlocks.length !== 1 ? "s" : ""}
        </div>

        {/* Blocks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlocks.map((block) => (
            <div
              key={block.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${
                        block.block_type === "html"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                    >
                      {getBlockIcon(block.block_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {block.block_name}
                      </h3>
                      <span className="text-xs text-gray-500 uppercase">
                        {block.block_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="flex items-center gap-2 mt-3">
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: block.colour }}
                  >
                    <Tag className="w-3 h-3" />
                    {block.category}
                  </div>
                </div>
              </div>

              {/* Code Preview */}
              <div className="p-4 bg-gray-50">
                <div className="text-xs font-mono text-gray-700 bg-white p-3 rounded border border-gray-200 overflow-x-auto max-h-32 overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-all">
                    {block.code_template}
                  </pre>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  Created {new Date(block.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleEdit(block)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBlocks.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No blocks found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <BlockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        block={selectedBlock}
        onSave={handleSave}
        categories={categories}
      />
    </div>
  );
}
