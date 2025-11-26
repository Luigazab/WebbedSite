import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { defineBlocks } from '../blocks/defineBlocks';
import { defineGenerators } from  '../blocks/defineGenerators';
import { useEffect, useRef, useState } from 'react';
import { javascriptGenerator } from 'blockly/javascript';
import { X, Menu, Play, Monitor, Laptop, Tablet, Smartphone, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router';
import { toolboxConfig } from '../blocks/toolboxConfig';
import { registerToolboxLabel } from '../blocks/ToolBoxLabel';
import { registerCustomCategory } from '../blocks/CustomCategory';
import Theme from '@blockly/theme-modern';
import { Divider } from '../components/Divider';
import ModalDropdown from '../components/ModalDropdown';
import SaveModal from '../modals/SaveModal';
import LoadModal from '../modals/LoadModal';

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [toolboxVisible, setToolboxVisible] = useState(true);
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
  const [responsive, setResponsive] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('desktop');


  useEffect(() => {
    if(!isInitialized) {
      defineBlocks();
      defineGenerators();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current && isInitialized){
      registerToolboxLabel();
      registerCustomCategory();
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolboxConfig,
        theme: Theme,
        zoom: {
          controls: true,
          wheel: true,
          startScale:1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        trashcan: true,
        move: {
          scrollbars: true,
          drag: true,
          wheel: true
        },
        grid: {
          spacing: 20,       // distance between dots
          length: 1,         // length of each dot
          colour: '#2f4f4f',    // color of the dots
          snap: true         // snap blocks to grid
        }
      });

      runCode();

      if (id) {
        loadProjectById(id);
      }
      
      // Cleanup
      return () => {
        if (workspace.current) {
          workspace.current.dispose();
          workspace.current = null;
        }
      };
    }
  }, [isInitialized, id]);


  const toggleToolbox = () => {
    if (!workspace.current) return;

    const newVisibility = !toolboxVisible;
    setToolboxVisible(newVisibility);
    
    // Use Blockly's built-in method to toggle toolbox
    const toolbox = workspace.current.getToolbox();
    
    if (toolbox) {
      if (newVisibility) {
        toolbox.setVisible(true);
      } else {
        toolbox.setVisible(false);
        // Close flyout when hiding toolbox
        workspace.current.getFlyout()?.setVisible(false);
      }
    }
    
    // Resize workspace to fill available space
    setTimeout(() => {
      if (workspace.current) {
        Blockly.svgResize(workspace.current);
      }
    }, 100);
  };


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
  const handleSave = async ({ title, description }) => {
    if (!title.trim()) {
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
      title,
      description,
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
      setProjectTitle(title);
      setProjectDescription(description);
      if(!currentProjectId) {
        navigate(`/editor/${savedProjectId}`, {replace: true});
      }
      setShowSaveModal(false);
      showMessage(`Project "${title}" saved successfully!`);
      loadUserProjects();
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

  const fileInputRef = useRef(null);

  // Import from file (Blockly JSON)
  const importFromFile = (event) => {
    const file = event.target.files?.[0];
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
  const triggerImport = () => {
    fileInputRef.current?.click();
  }

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
  const deviceSizes = {
    computer: { width: '100%', height: '80%', label: 'Desktop', icon: Monitor },
    laptop: { width: '80%', height: '50%', label: 'Laptop', icon: Laptop },
    tablet: { width: '768px', height: '1024px', label: 'Tablet', icon: Tablet },
    phone: { width: '375px', height: '667px', label: 'Phone', icon: Smartphone }
  };

  const toggleResponsiveView = () => {
    setResponsive(!responsive);
    if (responsive) {
      setSelectedDevice('desktop');
    }
  };

  const selectDevice = (device) => {
    setSelectedDevice(device);
    setResponsive(true);
  };

  return <div className="flex flex-col w-full h-full space-y-2 p-6 rounded-lg overflow-hidden">
    <input ref={fileInputRef} type="file" accept=".json" onChange={importFromFile} style={{ display: 'none' }}/>
    <div className="bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="flex-1 font-bold text-4xl text-left">WebbedSite <span className="text-green-700">Editor</span></h2>
        {currentProjectId && (
          <p className="flex-1 flex text-md text-gray-400 mt-2 font-semibold justify-center">
            Current: <span className='text-gray-600'>{projectTitle}</span>
          </p>
        )}
        <div className="flex-1 flex gap-2 justify-end">
          <button onClick={createNewProject} 
            className="flex items-center px-2 py-2 bg-orange-600 text-white font-semibold text-md rounded-xs border-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] border-black hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-orange-700 transition">
            New Project
          </button>
          <ModalDropdown label={'Save'} onClick={() => setShowSaveModal(true)} action={'Save to Projects'} description={'Saves online to your account'} onClick2={exportWorkspace} action2={'Export as JSON'} description2={'Saves project to your device that you can load back for next time'} onClick3={exportToFile} action3={'Export as File'} description3={'Save locally as an HTML and CSS file'} color={'green'}/>
          <ModalDropdown label={'Load'} onClick={() => setShowLoadModal(true)} action={'Load from Projects'} description={'Retrieves saved projects from your account'} onClick2={triggerImport} action2={'Import'} description2={'Retrieve saved project locally'} color={'blue'}/>
        </div>
      </div>
    </div>
    <Divider/>
    {message && (
      <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
        {message}
      </div>
    )}
    <div className="flex flex-1 overflow-hidden gap-3 px-1 py-1">
      <div className="flex flex-1 overflow-hidden rounded-sm border-2 relative drop-shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white">
        <button onClick={toggleToolbox} className="absolute top-1 left-1 z-50 bg-blue-800 text-white p-2 rounded-sm hover:bg-sky-800 transition-all" title={toolboxVisible ? "Hide Toolbox" : "Show Toolbox"}>
          {toolboxVisible ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div ref={blocklyDiv} className="flex-1 z-0"/>
      </div>
      <div className='w-3/10 relative'>
        <h4 className="absolute left-2 font-extrabold z-1 text-4xl font-mono [text-shadow:2px_2px_0_white,-2px_-2px_0_white,2px_-2px_0_white,-2px_2px_0_white] px-2">Preview</h4>
        <div id="outputPanel" className="flex-1 my-6 h-[95%] flex flex-col border-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white relative">
          <button onClick={runCode} className="absolute -top-6 left-45 px-2 py-2 bg-green-500 border-3 border-black text-black hover:bg-green-60 rounded-full hover:bg-green-600 hover:-translate-y-1 font-medium transition-all">
            <Play className='hover:stroke-white hover:fill-black transition-all' fill='white'/>
          </button>
          <div className="flex justify-around px-4 pt-8 bg-gray-900 border-b border-gray-200 group transition-all">
            <button onClick={() => setActiveTab('preview')}className={`px-5 py-2 font-bold border-b-4 ${
                activeTab === 'preview'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-600'
                }`}>Output
            </button>
            <button onClick={() => {setActiveTab('code'); runCode()}}className={`px-5 py-2 font-bold border-b-4 ${
              activeTab === 'code'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-600'
              }`}>Code
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {activeTab === 'preview' ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                {responsive && selectedDevice !== 'desktop' ? (
                  <div className="bg-white border-4 border-gray-800 shadow-2xl transition-all duration-300 overflow-hidden"
                    style={{ width: deviceSizes[selectedDevice].width,
                      height: deviceSizes[selectedDevice].height,
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }} >
                    <iframe 
                      srcDoc={generatedCode} 
                      className="w-full h-full border-0" 
                      title="preview" 
                      sandbox="allow-scripts"
                    />
                  </div>
                ) : (
                  <iframe 
                    srcDoc={generatedCode} 
                    className="w-full h-full border-0" 
                    title="preview" 
                    sandbox="allow-scripts"
                  />
                )}
              </div>
            ) : (
              <pre className="p-4 bg-gray-900 text-green-400 text-sm h-full overflow-auto font-mono">{generatedCode}</pre>
            )}
          </div>
          <div className='p-1 border-t-2 bg-slate-300'>
            <div className='flex justify-between items-center mb-2'>
              <h5 className='font-semibold'>Screen Sizes:</h5>
              <button 
                onClick={toggleResponsiveView} className='flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 cursor-pointer transition-colors'>
                {responsive ? (
                  <>
                    <Eye size={16} />
                    Device View
                  </>
                ) : (
                  <>
                    <EyeOff size={16} />
                    Full View
                  </>
                )}
              </button>
            </div>
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-1 m-1'>
              {Object.entries(deviceSizes).map(([key, device]) => {
                const IconComponent = device.icon;
                const isSelected = responsive && selectedDevice === key;
                return (
                  <button key={key} onClick={() => selectDevice(key)}
                    className={`border-2 border-black flex flex-col items-center rounded-sm hover:drop-shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:-translate-x-1 px-2 py-3 transition-all ${
                      isSelected 
                        ? 'bg-green-500 text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] -translate-y-1 -translate-x-1' 
                        : 'bg-white '
                    }`}>
                    <IconComponent size={24} />
                    <span className="text-xs mt-1">{device.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>

    <SaveModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} onSave={handleSave} initialTitle={projectTitle} initialDescription={projectDescription} />
    <LoadModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} projects={projects} onLoadProject={loadProject} onDeleteProject={deleteProject} />
  </div>;
};

export default Editor;
