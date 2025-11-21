import { Search, ThumbsUp, MessageCircleMore, Eye, Blocks } from "lucide-react";
import { useEffect, useState } from "react";
import Dropdown from "../components/Dropdown";
import { supabase } from "../supabaseClient";
import ProjectModal from "../modals/ProjectModal";
import { Divider } from "../components/Divider";

const Gallery = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [filters, setFilters] = useState({ 
    order: 'newest_first', 
    sort: 'last_modified'
  });
  
  const filterOptions = {
    sorts: [
      { value: 'last_modified', label: 'Last Modified' },
      { value: 'alphabetical', label: 'Alphabetical' },
      { value: 'date_created', label: 'Date Created' },
      { value: 'most_liked', label: 'Most Liked' },
      { value: 'most_viewed', label: 'Most Viewed' },
    ],
    orders: [
      { value: 'newest_first', label: 'Newest First' },
      { value: 'oldest_first', label: 'Oldest First' },
    ],
  };

  // Load public projects
  useEffect(() => {
    loadPublicProjects();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [projects, filters, searchQuery]);

  const loadPublicProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('is_public', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.profiles?.username && p.profiles.username.toLowerCase().includes(query))
      );
    }

    // Sort
    const sortField = filters.sort || 'last_modified';
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortField) {
        case 'alphabetical':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          return aVal.localeCompare(bVal);
        case 'date_created':
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
        case 'most_liked':
          aVal = a.likes_count || 0;
          bVal = b.likes_count || 0;
          return bVal - aVal; // Always descending for likes
        case 'most_viewed':
          aVal = a.views_count || 0;
          bVal = b.views_count || 0;
          return bVal - aVal; // Always descending for views
        case 'last_modified':
        default:
          aVal = new Date(a.updated_at);
          bVal = new Date(b.updated_at);
          break;
      }

      // Apply order (except for likes/views which are always descending)
      if (sortField !== 'most_liked' && sortField !== 'most_viewed') {
        const order = filters.order || 'newest_first';
        if (order === 'oldest_first') {
          return aVal - bVal;
        }
        return bVal - aVal;
      }
      
      return 0;
    });

    setFilteredProjects(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ order: 'newest_first', sort: 'last_modified' });
    setSearchQuery('');
  };

  const openProjectModal = async (project) => {
    // Increment view count
    try {
      const newViewCount = (project.views_count || 0) + 1;
      await supabase
        .from('projects')
        .update({ views_count: newViewCount })
        .eq('id', project.id);
      
      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === project.id ? { ...p, views_count: newViewCount } : p
      ));
      
      setSelectedProject({ ...project, views_count: newViewCount });
    } catch (error) {
      console.error('Error incrementing view count:', error);
      setSelectedProject(project);
    }
    
    setShowProjectModal(true);
  };

  const handleProjectModalClose = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
    // Reload to get updated likes/comments
    loadPublicProjects();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col w-full h-full space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-4xl text-slate-900">Gallery</h1>
          <p className="text-gray-600 mt-1 text-xl font-medium">Discover amazing projects from the community</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex justify-between space-x-2 flex-wrap gap-2">
        <div className="flex flex-1 space-x-2 items-center flex-wrap gap-2">
          <Dropdown name="sort" value={filters.sort} selectmessage="Sort By" options={filterOptions.sorts} onChange={handleFilterChange}/>
          {filters.sort !== 'most_liked' && filters.sort !== 'most_viewed' && (
            <Dropdown name="order" value={filters.order} selectmessage="Order" options={filterOptions.orders} onChange={handleFilterChange}/>
          )}
          <button onClick={clearFilters}className="font-medium bg-purple-700 px-3 py-2 rounded-xs border-3 border-black text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-purple-600 transition">
            Clear Filter
          </button>
        </div>
        <div className="flex-1 flex space-x-2 items-center flex-wrap gap-2">
          <label className="flex-1 flex items-center gap-2 rounded-sm border-3 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white px-3 py-3 text-muted-foreground focus-within:ring-yellow-800 focus-within:ring-2 focus-within:ring-ring md:text-sm">
            <Search size={20} className="text-gray-500" />
            <input type="text" placeholder="Search projects or creators..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent font-medium outline-none placeholder:text-gray-400" />
          </label>
          <button className="font-medium bg-purple-700 text-white px-3 py-2 rounded-sm border-3 border-black drop-shadow-[4px_4px_0_rgba(0,0,0,1)] hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-purple-600 transition">Search</button>
        </div>
      </div>

      <Divider/>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500 text-lg font-medium">Loading gallery...</div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-gray-400 text-6xl mb-4"><Blocks/></div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {projects.length === 0 ? 'No public projects yet' : 'No projects found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {projects.length === 0 
              ? 'Be the first to share your creation!' 
              : 'Try adjusting your filters or search query'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProjects.map((project) => (
            <div key={project.id} onClick={() => openProjectModal(project)}
              className="border border-sky-700 rounded-sm bg-blue-200 hover:drop-shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all cursor-pointer group">
              {/* Preview */}
              <div className="relative w-full h-40 flex items-center justify-center rounded-t-sm bg-linear-to-br from-blue-50 to-purple-50 overflow-hidden">
                {project.generated_html ? (
                  <iframe srcDoc={project.generated_html} className="w-full h-full border-0 pointer-events-none scale-200 origin-top-left"
                    title={`Preview of ${project.title}`} sandbox=""/>
                ) : (
                  <div className="text-gray-400 text-sm">No preview</div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      View Project
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="px-3 py-2">
                <h2 className="font-medium text-slate-900 text-lg truncate" title={project.title}>
                  {project.title}
                </h2>
                
                <p className="text-xs text-gray-500">
                  by <span className="font-medium text-sky-700">{project.profiles?.username || 'Unknown'}</span>
                </p>
                
                <div className="flex items-center gap-3 text-xs text-gray-700 mt-1">
                  <span className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {project.likes_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircleMore size={14} />
                    {project.comments_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {project.views_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && filteredProjects.length > 0 && (
        <div className="text-md font-semibold text-gray-500 text-center py-2">
          Showing {filteredProjects.length} of {projects.length} public projects
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal isOpen={showProjectModal} onClose={handleProjectModalClose} 
          id={selectedProject.id} title={selectedProject.title} description={selectedProject.description || ''} likes={selectedProject.likes_count || 0} comments={selectedProject.comments_count || 0} srcDoc={selectedProject.generated_html} isPublic={selectedProject.is_public} projectOwnerId={selectedProject.user_id}/>
      )}
    </div>
  );
};

export default Gallery;