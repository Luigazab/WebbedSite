import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { defineBlocks } from '../blocks/defineBlocks';
import { defineGenerators } from  '../blocks/defineGenerators';
import { useEffect, useRef, useState } from 'react';
import { javascriptGenerator } from 'blockly/javascript';
import { Download, FolderOpen, Save, Trash2, Upload } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState('');


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

      if (id) {
        loadProjectById(id);
      }
      const ws = workspace.current;

      // Hard auto-close: hide flyout when clicking outside toolbox
      const onDocPointerDown = (e) => {
        const toolboxEl = ws.getToolbox()?.getHtmlDiv?.();
        const flyout = ws.getFlyout?.();

        // If there's no toolbox or flyout, nothing to do
        if (!toolboxEl || !flyout) return;

        const clickedInsideToolbox = toolboxEl.contains(e.target);
        if (!clickedInsideToolbox) {
          // Prefer setVisibility if available; fallback to hide
          if (typeof flyout.setVisibility === 'function') {
            flyout.setVisibility(false);
          } else if (typeof flyout.hide === 'function') {
            flyout.hide();
          }
        }
      };

      document.addEventListener('pointerdown', onDocPointerDown);

      // Cleanup
      return () => {
        document.removeEventListener('pointerdown', onDocPointerDown);
        if (workspace.current) {
          workspace.current.dispose();
          workspace.current = null;
        }
      };
    }
  }, [isInitialized, id]);

  const loadProjectById = async (projectId) => {
    try{
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        showMessage('Project not found', true);
        navigate('/editor');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if(data.user_id !== user?.id) {
        showMessage('You do not have access to this project', true);
        navigate('editor');
        return;
      }

      if (workspace.current && data.blocks_json) {
        Blockly.serialization.workspaces.load(data.blocks_json, workspace.current);
        setProjectTitle(data.title);
        setProjectDescription(data.description || '');
        setCurrentProjectId(data.id);
        runCode();
        showMessage(`Loaded "${data.title}"`);
      }
    }catch (error) {
      console.error('Error Loading project', error);
      showMessage('Error loading project', true);
    }
  };

  const runCode = () => {
    if (workspace.current){
      const code = javascriptGenerator.workspaceToCode(workspace.current);
      setGeneratedCode(code);
    }
  };

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

   // Save workspace state to memory (simulating Supabase)
  const saveProject = async () => {
    if (!projectTitle.trim()) {
      showMessage('Please enter a project title', true);
      return;
    }

    const workspaceState = Blockly.serialization.workspaces.save(workspace.current);
    const code = javascriptGenerator.workspaceToCode(workspace.current);

    const { data: { user } } = await supabase.auth.getUser();
    
    if(!user){
      showMessage('Please log in to save', true);
      return;
    }
    const projectData = {
      user_id: user.id,
      title: projectTitle,
      description: projectDescription,
      blocks_json: workspaceState,
      generated_html: code,
      is_public: false,
      updated_at: new Date().toISOString()
    };
    
    let result;
    if (currentProjectId){
      result = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', currentProjectId)
        .select();
    }else{
      result = await supabase
        .from('projects')
        .insert([projectData])
        .select();
    }

    if (result.error) {
      showMessage('Save failed: ' + result.error.message, true);
    } else {
      const savedProjectId = result.data[0].id
      setCurrentProjectId(savedProjectId);
      if(!currentProjectId) {
        navigate(`/editor/${savedProjectId}`, {replace: true});
      }
      setShowSaveModal(false);
      showMessage(`Project "${projectTitle}" saved successfully!`);
      loadUserProjects(); // Refresh list
    }
  };

  // Load workspace from saved state
  const loadProject = (project) => {
    if (workspace.current && project.blocks_json) {
      navigate(`/editor/${project.id}`);
      Blockly.serialization.workspaces.load(project.blocks_json, workspace.current);
      setProjectTitle(project.title);
      setProjectDescription(project.description || '');
      setCurrentProjectId(project.id);
      runCode();
      setShowLoadModal(false);
      showMessage(`Loaded "${project.title}"`);
    }
  };
  
  const loadUserProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if(!error){
      setProjects(data);
    }
  };

  useEffect(() => {
    loadUserProjects();
  }, []);

  // Delete project
  const deleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      if (currentProjectId === projectId) {
        setCurrentProjectId(null);
        setProjectTitle('');
        setProjectDescription('');
        navigate('/editor', { replace: true });
        
        // Clear workspace
        if (workspace.current) {
          workspace.current.clear();
        }
      }
      
      showMessage('Project deleted');
    } catch (error) {
      console.error('Error deleting project:', error);
      showMessage('Error deleting project', true);
    }
  };

  const createNewProject = () => {
    if (workspace.current) {
      workspace.current.clear();
    }
    setProjectTitle('Untitled');
    setProjectDescription('');
    navigate('/editor', { replace: true });
    showMessage('New project created');
  }

  // Export as HTML file
  const exportToFile = () => {
    const code = javascriptGenerator.workspaceToCode(workspace.current);
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || 'website'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('HTML file downloaded!');
  };

  // Import from file (Blockly JSON)
  const importFromFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          Blockly.serialization.workspaces.load(json, workspace.current);
          runCode();
          showMessage('Workspace imported successfully!');
        } catch (error) {
          showMessage('Invalid file format', true);
        }
      };
      reader.readAsText(file);
    }
  };

  // Export workspace as JSON
  const exportWorkspace = () => {
    const workspaceState = Blockly.serialization.workspaces.save(workspace.current);
    const blob = new Blob([JSON.stringify(workspaceState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle || 'workspace'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Workspace exported!');
  };

  return <div className="flex flex-col w-full h-full space-y-2 p-6 rounded-lg">
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-4xl text-left">WebbedSite <span className="text-green-700">Editor</span></h2>
        {currentProjectId && (
          <p className="text-sm text-gray-600 mt-2">
            Current: <span className='font-semibold'>{projectTitle}</span>
          </p>
        )}
        <div className="flex gap-2">
          <button onClick={createNewProject} 
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            New Project
          </button>
          <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <Save size={18}/>
            Save Project
          </button>
          <button onClick={() => setShowLoadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <FolderOpen size={18}/>
            Load
          </button>
          <button onClick={exportToFile} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Download size={18}/>
            Export HTML
          </button>
        </div>
      </div>
      
    </div>
    {message && (
      <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
        {message}
      </div>
    )}
    <div className="flex flex-1 overflow-hidden bg-amber-100 rounded-2xl border-2">
      <div ref={blocklyDiv} className="flex-1 z-0"/>
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
            <pre className="p-4 bg-gray-900 text-green-400 text-sm h-full overflow-auto font-mono">{generatedCode}</pre>
          )}
        </div>
      </div>
    </div>

    {showSaveModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
          <h3 className="text-2xl font-bold mb-4">Save Project</h3>
          <input
            type="text"
            placeholder="Project Title"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <div className="flex gap-3">
            <button
              onClick={saveProject}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition"
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveModal(false)}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Load Modal */}
    {showLoadModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-auto">
          <h3 className="text-2xl font-bold mb-4">Load Project</h3>
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No saved projects yet</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{project.title}</h4>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(project.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadProject(project)}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        <Upload size={18} />
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowLoadModal(false)}
            className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            Close
          </button>
        </div>
      </div>
    )}
  </div>;
};

export default Editor;
