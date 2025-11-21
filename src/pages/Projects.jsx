import { Eye, EyeOff, Edit, Trash2, Search, Blocks } from "lucide-react";
import { useEffect, useState } from "react";
import Dropdown from "../components/Dropdown";
import { supabase } from "../supabaseClient";
import ProjectModal from "../modals/ProjectModal";
import { useNavigate } from "react-router";
import { Divider } from "../components/Divider";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [filters, setFilters] = useState({ 
    category: 'all', 
    order: 'newest_first', 
    sort: 'last_modified'
  });
  
  const filterOptions = {
    sorts: [
      { value: 'last_modified', label: 'Last Modified' },
      { value: 'alphabetical', label: 'Alphabetical' },
      { value: 'date_created', label: 'Date Created' },
    ],
    categories: [
      { value: 'all', label: 'All' },
      { value: 'public', label: 'Public' },
      { value: 'private', label: 'Private' },
    ],
    orders: [
      { value: 'newest_first', label: 'Newest First' },
      { value: 'oldest_first', label: 'Oldest First' },
    ],
  };

  // Load projects from Supabase
  useEffect(() => {
    loadProjects();
  }, []);

  // Apply filters whenever projects or filter values change
  useEffect(() => {
    applyFilters();
  }, [projects, filters, searchQuery]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
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

    // Filter by category (public/private)
    if (filters.category && filters.category !== 'all') {
      if (filters.category === 'public') {
        filtered = filtered.filter(p => p.is_public === true);
      } else if (filters.category === 'private') {
        filtered = filtered.filter(p => p.is_public === false);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
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
        case 'last_modified':
        default:
          aVal = new Date(a.updated_at);
          bVal = new Date(b.updated_at);
          break;
      }

      // Apply order
      const order = filters.order || 'newest_first';
      if (order === 'oldest_first') {
        return aVal - bVal;
      }
      return bVal - aVal;
    });

    setFilteredProjects(filtered);
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', order: 'newest_first', sort: 'last_modified' });
    setSearchQuery('');
  };

  const toggleVisibility = async (projectId, currentVisibility) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_public: !currentVisibility })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, is_public: !currentVisibility } : p
      ));
    } catch (error) {
      console.error('Error updating visibility:', error);
    }
  };

  const deleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  }

  const handleProjectModalClose = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return <div className="flex flex-col w-full h-full space-y-4 p-6">
    <div>
      <h1 className="font-bold text-4xl text-slate-900">Projects</h1>
      <p className="text-gray-600 mt-1 text-xl font-medium">View all projects you have</p>
    </div>
    {/* --------------Filter part--------------- */}
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="md:flex-1 flex flex-wrap gap-2">
        <Dropdown name="category" value={filters.category} allowEmpty={false} selectmessage="All Categories" options={filterOptions.categories} onChange={handleFilterChange} />
        <Dropdown name="order" value={filters.order} selectmessage="Order" allowEmpty={false} options={filterOptions.orders} onChange={handleFilterChange} />
        <Dropdown name="sort" value={filters.sort} selectmessage="Sort By" allowEmpty={false} options={filterOptions.sorts} onChange={handleFilterChange} />
        <div className="flex justify-end">
          <button type="button" onClick={clearFilters} className="font-medium bg-purple-700 px-3 py-2 rounded-xs border-3 border-black text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-purple-600 transition">Clear Filter</button>
        </div>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <label className="flex-1 flex items-center gap-2 rounded-xs border-3 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white px-3 py-3 text-muted-foreground focus-within:ring-yellow-800 focus-within:ring-2 focus-within:ring-ring md:text-sm">
          <Search size={20}/>
          <input type="text" value={searchQuery} onChange={(e) => {setSearchQuery(e.target.value)}} placeholder="Search projects..." className="w-full bg-transparent font-medium outline-none placeholder:text-gray-400" />
        </label>
        <button className="font-medium bg-purple-700 text-white px-3 py-2 rounded-sm border-3 border-black drop-shadow-[4px_4px_0_rgba(0,0,0,1)] hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-purple-600 transition">Search</button>
      </div>
    </div>
    {/* -------------End of Filter Part----------- */}
    <Divider/>
    {/* -------------Project Cards---------------- */}
    {loading ? (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500 text-lg">Loading projects...</div>
      </div>
    ) : filteredProjects.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-gray-400 text-6xl mb-4"><Blocks/></div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          {projects.length === 0 ? 'No projects yet' : 'No projects found'}
        </h3>
        <p className="font-medium text-gray-500 mb-4">
          {projects.length === 0 
            ? 'Create your first project to get started!' 
            : 'Try adjusting your filters or search query'}
        </p>
        {projects.length === 0 && (
          <button onClick={() => navigate('/editor')}
            className="px-6 py-3 bg-green-700 text-white rounded-sm border-2 border-black drop-shadow-[0_4px_0_rgba(0,0,0,1)] hover:drop-shadow-[0_2px_0_rgba(0,0,0,1)] hover:bg-green-600 transition font-semibold">
            Create New Project
          </button>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProjects.map((project) => (
          <div key={project.id} 
            className="border border-sky-700 rounded-sm bg-blue-200 hover:drop-shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all group">
            {/* Preview */}
            <div className="relative w-full h-40 flex items-center justify-center rounded-t-sm bg-linear-to-br from-blue-50 to-purple-50 overflow-hidden">
              {project.generated_html ? (
                <iframe srcDoc={project.generated_html}
                  className="w-full h-full border-0 pointer-events-none scale-200 origin-top-left"
                  title={`Preview of ${project.title}`} sandbox="allow-scripts"/>
              ) : (
                <div className="text-gray-400 text-sm">No preview</div>
              )}
              
              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openProjectModal(project)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                  title="Edit">
                  <Edit size={18} className="text-gray-700" />
                </button>
                <button onClick={() => deleteProject(project.id)}
                  className="p-2 bg-white rounded-full hover:bg-red-100 transition"
                  title="Delete">
                  <Trash2 size={18} className="text-red-600" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="px-3 py-2 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="font-medium text-lg text-slate-900 truncate" title={project.title}>{project.title}</h2>
                <p className="text-slate-500 text-xs">Edited {formatDate(project.updated_at)}</p>
              </div>
              <button onClick={() => toggleVisibility(project.id, project.is_public)}
                className="ml-2 p-1 hover:bg-gray-100 rounded transition"
                title={project.is_public ? 'Make private' : 'Make public'}>
                {project.is_public ? (
                  <Eye size={20} className="text-green-600" />
                ) : (
                  <EyeOff size={20} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Results count */}
    {!loading && filteredProjects.length > 0 && (
      <div className="text-md font-semibold text-gray-500 text-center py-2">
        Showing {filteredProjects.length} of {projects.length} projects
      </div>
    )}
    {/* -----------End of Project Cards------------ */}
    {selectedProject && (
      <ProjectModal isOpen={showProjectModal} onClose={handleProjectModalClose} id={selectedProject.id} title={selectedProject.title} description={selectedProject.description || ''} likes={selectedProject.likes_count || 0} comments={selectedProject.comments_count || 0} srcDoc={selectedProject.generated_html} isPublic={selectedProject.is_public} projectOwnerId={selectedProject.user_id}/>
    )}
  </div>;
};

export default Projects;
