import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import { useEffect, useRef, useState } from 'react';
import { javascriptGenerator } from 'blockly/javascript';
import { X, Menu, Play, BookOpen } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router';
import { registerToolboxLabel } from '../blocks/ToolBoxLabel';
import { registerCustomCategory } from '../blocks/CustomCategory';
import Theme from '@blockly/theme-modern';
import { Divider } from '../components/Divider';
import ModalDropdown from '../components/ModalDropdown';
import SaveModal from '../modals/SaveModal';
import LoadModal from '../modals/LoadModal';
import {FieldColour} from '@blockly/field-colour';
import '../renderers/custom'
import DevicePreviewModal from '../modals/DevicePreviewModal';
import DeviceSelector from '../components/DeviceSelector';
import { buildDynamicToolbox, registerBlockWithGenerator } from '../utils/blocklyUtil';
import { deviceSizes } from '../utils/deviceConstant';
import TutorialPanel from '../components/TutorialPanel';
import TutorialSelectorModal from '../modals/TutorialSelectorModal';
import BadgeEarnedModal from '../modals/BadgeEarnedModal';
import { validateTutorialStep } from '../utils/tutorialValidation';

Blockly.fieldRegistry.register('field_colour', FieldColour);

const Tutorial = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const fileInputRef = useRef(null);

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
  const [dynamicToolbox, setDynamicToolbox] = useState(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);

  // Tutorial System States
  const [tutorialMode, setTutorialMode] = useState(false);
  const [showTutorialSelector, setShowTutorialSelector] = useState(false);
  const [tutorials, setTutorials] = useState([]);
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [tutorialSteps, setTutorialSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [userProgress, setUserProgress] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState(null);

  // Load blocks from Supabase
  const loadBlocksFromSupabase = async () => {
    try {
      const { data: blocks, error } = await supabase
        .from('blocks')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error loading blocks:', error);
        showMessage('Error loading blocks from database', true);
        return;
      }

      if (!blocks || blocks.length === 0) {
        console.warn('No blocks found in database');
        showMessage('No blocks found in database', true);
        return;
      }

      blocks.forEach(registerBlockWithGenerator);
      const finalToolbox = buildDynamicToolbox(blocks);
      setDynamicToolbox(finalToolbox);
      showMessage(`Loaded ${blocks.length} blocks from database`);
      
    } catch (error) {
      console.error('Error loading blocks:', error);
      showMessage('Error loading blocks', true);
    }
  };

  // Load tutorials from database
  const loadTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .order('order_index', { ascending: true });

      if (!error && data) {
        setTutorials(data);
      }
    } catch (error) {
      console.error('Error loading tutorials:', error);
    }
  };

  // Load user progress
  const loadUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setUserProgress(data);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  useEffect(() => {
    if (!isInitialized) {
      loadBlocksFromSupabase();
      loadTutorials();
      loadUserProgress();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (blocklyDiv.current && !workspace.current && isInitialized && dynamicToolbox) {
      registerToolboxLabel();
      registerCustomCategory();
      
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: dynamicToolbox,
        theme: Theme,
        renderer: 'custom_renderer',
        zoom: {
          controls: true,
          wheel: true,
          startScale: 1.0,
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
          spacing: 20,
          length: 1,
          colour: '#2f4f4f',
          snap: true
        }
      });

      workspace.current.addChangeListener(() => {
        runCode();
        if (tutorialMode) {
          checkStepCompletion();
        }
      });

      if (id) {
        loadProjectById(id);
      }
      
      return () => {
        if (workspace.current) {
          workspace.current.dispose();
          workspace.current = null;
        }
      };
    }
  }, [isInitialized, id, dynamicToolbox, tutorialMode]);

  const toggleToolbox = () => {
    if (!workspace.current) return;
    const newVisibility = !toolboxVisible;
    setToolboxVisible(newVisibility);
    
    const toolbox = workspace.current.getToolbox();
    if (toolbox) {
      toolbox.setVisible(newVisibility);
      if (!newVisibility) {
        workspace.current.getFlyout()?.setVisible(false);
      }
    }
    
    setTimeout(() => {
      if (workspace.current) {
        Blockly.svgResize(workspace.current);
      }
    }, 100);
  };

  const runCode = () => {
    if (workspace.current) {
      const code = javascriptGenerator.workspaceToCode(workspace.current);
      setGeneratedCode(code);
    }
  };

  const showMessage = (msg, isError = false) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Tutorial Functions
  const startTutorial = async (tutorial) => {
    try {
      // Load tutorial steps
      const { data: steps, error } = await supabase
        .from('tutorial_steps')
        .select('*')
        .eq('tutorial_id', tutorial.id)
        .order('step_order', { ascending: true });

      if (error) throw error;

      setCurrentTutorial(tutorial);
      setTutorialSteps(steps);
      setTutorialMode(true);
      setShowTutorialSelector(false);

      // Check for existing progress
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('tutorial_id', tutorial.id)
          .eq('user_id', user.id)
          .single();

        const startStep = progress?.is_completed ? 0 : (progress?.current_step || 0);
        setCurrentStepIndex(startStep);
      } else {
        setCurrentStepIndex(0);
      }

      // Clear workspace for fresh start
      if (workspace.current) {
        workspace.current.clear();
      }

      setToolboxVisible(true);
      showMessage(`Started tutorial: ${tutorial.title}`);
    } catch (error) {
      console.error('Error starting tutorial:', error);
      showMessage('Error starting tutorial', true);
    }
  };

  const checkStepCompletion = () => {
    if (!tutorialMode || !tutorialSteps[currentStepIndex]) return;

    const currentStep = tutorialSteps[currentStepIndex];
    const workspaceJson = Blockly.serialization.workspaces.save(workspace.current);
    
    const isValid = validateTutorialStep(currentStep, workspaceJson, generatedCode);
    setIsStepComplete(isValid);
  };

  const goToNextStep = async () => {
    if (!isStepComplete) return;

    const isLastStep = currentStepIndex === tutorialSteps.length - 1;

    if (isLastStep) {
      await completeTutorial();
    } else {
      const nextStep = currentStepIndex + 1;
      setCurrentStepIndex(nextStep);
      setIsStepComplete(false);

      // Save progress
      await saveProgress(nextStep, false);
      showMessage(`Step ${nextStep + 1} of ${tutorialSteps.length}`);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setIsStepComplete(false);
    }
  };

  const saveProgress = async (step, completed) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const progressData = {
        user_id: user.id,
        tutorial_id: currentTutorial.id,
        current_step: step,
        is_completed: completed,
        completed_at: completed ? new Date().toISOString() : null
      };

      const { data: existing } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('tutorial_id', currentTutorial.id)
        .single();

      if (existing) {
        await supabase
          .from('user_progress')
          .update(progressData)
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_progress')
          .insert([progressData]);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const completeTutorial = async () => {
    try {
      await saveProgress(tutorialSteps.length - 1, true);

      // Award badge
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: badge } = await supabase
          .from('badges')
          .select('*')
          .eq('tutorial_id', currentTutorial.id)
          .single();

        if (badge) {
          await supabase
            .from('achievements')
            .insert([{
              user_id: user.id,
              badge_earned: badge.id
            }]);

          setEarnedBadge(badge);
          setShowBadgeModal(true);
        }
      }

      showMessage(`🎉 Congratulations! You completed "${currentTutorial.title}"!`);
      await loadUserProgress();
    } catch (error) {
      console.error('Error completing tutorial:', error);
      showMessage('Tutorial completed!');
    }
  };

  const exitTutorial = () => {
    setTutorialMode(false);
    setCurrentTutorial(null);
    setTutorialSteps([]);
    setCurrentStepIndex(0);
    setIsStepComplete(false);
    showMessage('Exited tutorial mode');
  };

  const handleBadgeModalClose = () => {
    setShowBadgeModal(false);
    exitTutorial();
  };

  // ... (keep all other existing functions: loadProjectById, handleSave, loadProject, etc.)
  const loadProjectById = async (projectId) => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        showMessage('Project not found', true);
        navigate('/tutorial');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (data.user_id !== user?.id) {
        showMessage('You do not have access to this project', true);
        navigate('/tutorial');
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
    } catch (error) {
      console.error('Error Loading project', error);
      showMessage('Error loading project', true);
    }
  };

  const handleSave = async ({ title, description }) => {
    if (!title.trim()) {
      showMessage('Please enter a project title', true);
      return;
    }

    const workspaceState = Blockly.serialization.workspaces.save(workspace.current);
    const code = javascriptGenerator.workspaceToCode(workspace.current);

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
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
    const projectIdToUpdate = id || currentProjectId;

    if (projectIdToUpdate) {
      result = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectIdToUpdate)
        .select();
    } else {
      result = await supabase
        .from('projects')
        .insert([projectData])
        .select();
    }

    if (result.error) {
      showMessage('Save failed: ' + result.error.message, true);
    } else {
      const savedProjectId = result.data[0].id;
      setCurrentProjectId(savedProjectId);
      setProjectTitle(title);
      setProjectDescription(description);
      if (!projectIdToUpdate) {
        navigate(`/tutorial/${savedProjectId}`, { replace: true });
      }
      setShowSaveModal(false);
      showMessage(`Project "${title}" saved successfully!`);
      loadUserProjects();
    }
  };

  const loadProject = (project) => {
    if (workspace.current && project.blocks_json) {
      navigate(`/tutorial/${project.id}`);
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

    if (!error) {
      setProjects(data);
    }
  };

  useEffect(() => {
    loadUserProjects();
  }, []);

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
        navigate('/tutorial', { replace: true });
        
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
    setCurrentProjectId(null);
    navigate('/tutorial', { replace: true });
    showMessage('New project created');
  };

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
  };

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

  const toggleResponsiveView = () => {
    setResponsive(!responsive);
    if (responsive) {
      setSelectedDevice('desktop');
      setShowDeviceModal(false);
    }
  };

  const selectDevice = (device) => {
    setSelectedDevice(device);
    setResponsive(true);
    setShowDeviceModal(device !== 'desktop');
  };

  return (
    <div className="flex flex-col w-full h-full rounded-lg p-2 overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".json" onChange={importFromFile} style={{ display: 'none' }}/>
      
      {/* Header */}
      <div className="bg-white px-6">
        <div className="flex items-center justify-between">
          <h2 className="flex-1 font-bold text-5xl text-left translate-y-2 -translate-x-2">
            WebbedSite <span className="text-green-700">Editor</span>
          </h2>
          {currentProjectId && (
            <p className="flex-1 flex text-md text-gray-400 mt-2 font-semibold justify-center">
              Current: <span className='text-gray-600'>{projectTitle}</span>
            </p>
          )}
          <div className="flex-1 flex gap-2 justify-end">
            <button 
              onClick={() => setShowTutorialSelector(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold text-md rounded-xs border-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] border-black hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-purple-700 transition"
            >
              <BookOpen size={20} />
              Tutorials
            </button>
            <button onClick={createNewProject} 
              className="flex items-center px-2 py-2 bg-orange-600 text-white font-semibold text-md rounded-xs border-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] border-black hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-orange-700 transition">
              New Project
            </button>
            <ModalDropdown label={'Save'} onClick={() => setShowSaveModal(true)} action={'Save to Projects'} description={'Saves online to your account'} onClick2={exportWorkspace} action2={'Export as JSON'} description2={'Saves project to your device'} onClick3={exportToFile} action3={'Export as File'} description3={'Save as HTML file'} color={'green'} />
            <ModalDropdown label={'Load'} onClick={() => setShowLoadModal(true)} action={'Load from Projects'} description={'Retrieves saved projects'} onClick2={triggerImport} action2={'Import'} description2={'Load from device'} color={'blue'}/>
          </div>
        </div>
      </div>
      <Divider />

      {message && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
          {message}
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden gap-3 px-1 py-1">
        {/* Tutorial Panel (conditionally rendered) */}
        {tutorialMode && (
          <div className="w-full md:w-80 h-full">
            <TutorialPanel
              tutorial={currentTutorial}
              currentStep={currentStepIndex}
              steps={tutorialSteps}
              onNextStep={goToNextStep}
              onPreviousStep={goToPreviousStep}
              onExitTutorial={exitTutorial}
              isStepComplete={isStepComplete}
            />
          </div>
        )}

        {/* Blockly Workspace */}
        <div className="flex flex-1 md:overflow-hidden rounded-sm border-2 relative drop-shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white">
          <button onClick={toggleToolbox} 
            className="absolute top-1 left-1 z-50 bg-blue-800 text-white p-2 rounded-sm hover:bg-sky-800 transition-all" 
            title={toolboxVisible ? "Hide Toolbox" : "Show Toolbox"}>
            {toolboxVisible ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div ref={blocklyDiv} className="blocklyDiv flex-1 z-0" />
        </div>

        {/* Preview Panel */}
        <div className='w-full md:w-3/10 relative'>
          <h4 className="absolute left-2 font-extrabold z-1 text-4xl font-mono [text-shadow:2px_2px_0_white,-2px_-2px_0_white,2px_-2px_0_white,-2px_2px_0_white] px-2">
            Preview
          </h4>
          <div id="outputPanel" className="flex-1 my-6 md:h-[95%] flex flex-col border-2 drop-shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white relative">
            <button onClick={runCode} 
              className="absolute -top-6 left-45 px-2 py-2 bg-green-500 border-3 border-black text-black hover:bg-green-60 rounded-full hover:bg-green-600 hover:-translate-y-1 font-medium transition-all"
            >
              <Play className='hover:stroke-white hover:fill-black transition-all' fill='white' />
            </button>
            <div className="flex justify-around px-4 pt-8 bg-gray-900 border-b border-gray-200 group transition-all">
              <button 
                onClick={() => setActiveTab('preview')}
                className={`px-5 py-2 font-bold border-b-4 ${
                  activeTab === 'preview'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-600'
                }`}
              >
                Output
              </button>
              <button 
                onClick={() => {setActiveTab('code'); runCode()}}
                className={`px-5 py-2 font-bold border-b-4 ${
                  activeTab === 'code'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-600'
                }`}
              >
                Code
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {activeTab === 'preview' ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <iframe srcDoc={generatedCode} className="w-full h-full border-0" title="preview" sandbox="allow-scripts"/>
                </div>
              ) : (
                <pre className="p-4 bg-gray-900 text-green-400 text-sm h-full overflow-auto font-mono">
                  {generatedCode}
                </pre>
              )}
            </div>
            <DeviceSelector deviceSizes={deviceSizes} responsive={responsive} selectedDevice={selectedDevice} onToggleResponsive={toggleResponsiveView} onSelectDevice={selectDevice}/>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DevicePreviewModal 
        isOpen={showDeviceModal}
        device={selectedDevice}
        deviceSizes={deviceSizes}
        generatedCode={generatedCode}
        onClose={() => setShowDeviceModal(false)}
      />

      <SaveModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
        onSave={handleSave} 
        initialTitle={projectTitle} 
        initialDescription={projectDescription} 
      />

      <LoadModal 
        isOpen={showLoadModal} 
        onClose={() => setShowLoadModal(false)} 
        projects={projects} 
        onLoadProject={loadProject} 
        onDeleteProject={deleteProject} 
      />

      <TutorialSelectorModal
        isOpen={showTutorialSelector}
        onClose={() => setShowTutorialSelector(false)}
        tutorials={tutorials}
        onSelectTutorial={startTutorial}
        userProgress={userProgress}
      />

      <BadgeEarnedModal
        isOpen={showBadgeModal}
        onClose={handleBadgeModalClose}
        badge={earnedBadge}
        tutorialTitle={currentTutorial?.title}
      />
    </div>
  );
};

export default Tutorial;