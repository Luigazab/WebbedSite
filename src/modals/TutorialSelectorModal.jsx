import { X, Clock, Award, ChevronRight } from 'lucide-react';

const TutorialSelectorModal = ({ isOpen, onClose, tutorials, onSelectTutorial, userProgress }) => {
  if (!isOpen) return null;

  const getDifficultyColor = (level) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-700 border-green-300',
      'intermediate': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'advanced': 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[level.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getProgressForTutorial = (tutorialId) => {
    return userProgress?.find(p => p.tutorial_id === tutorialId);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border-2 border-black drop-shadow-[8px_8px_0_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-blue-600 text-white p-6 border-b-2 border-black">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Choose Your Tutorial</h2>
              <p className="text-purple-100">Learn to build websites with guided lessons</p>
            </div>
            <button 
              onClick={onClose}
              className="hover:bg-white/20 p-2 rounded transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tutorial List */}
        <div className="p-6 bg-slate-100 overflow-y-auto max-h-[calc(90vh-120px)]">
          {tutorials.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No tutorials available yet.</p>
              <p className="text-sm mt-2">Check back soon for new learning content!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tutorials.map((tutorial) => {
                const progress = getProgressForTutorial(tutorial.id);
                const isCompleted = progress?.is_completed;
                const continueStep = progress?.current_step || 0;

                return (
                  <div 
                    key={tutorial.id}
                    className="border-2 border-black rounded-lg overflow-hidden hover:drop-shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all"
                  >
                    <div className="flex bg-white">
                      {/* Thumbnail */}
                      <div className="w-48 bg-linear-to-br from-purple-400 to-blue-400 flex items-center justify-center border-r-2 border-black">
                        {tutorial.thumbnail_url ? (
                          <img 
                            src={tutorial.thumbnail_url} 
                            alt={tutorial.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-4xl font-bold">
                            {tutorial.order_index}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{tutorial.title}</h3>
                          {isCompleted && (
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-semibold">
                              <Award size={16} />
                              Completed
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3">{tutorial.description}</p>
                        
                        <div className="flex items-center gap-3 text-sm">
                          <span className={`px-2 py-1 rounded-full border font-semibold ${getDifficultyColor(tutorial.difficulty_level)}`}>
                            {tutorial.difficulty_level}
                          </span>
                          {tutorial.estimated_time_minutes && (
                            <span className="flex items-center gap-1 text-gray-600">
                              <Clock size={14} />
                              {tutorial.estimated_time_minutes} min
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        {progress && !isCompleted && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>In Progress</span>
                              <span>Step {continueStep + 1}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 transition-all"
                                style={{ width: `${((continueStep + 1) / (tutorial.step_count || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center px-4 border-l-2 border-black">
                        <button
                          onClick={() => onSelectTutorial(tutorial)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:drop-shadow-[1px_1px_0_rgba(0,0,0,1)] transition-all flex items-center gap-2"
                        >
                          {isCompleted ? 'Replay' : progress ? 'Continue' : 'Start'}
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialSelectorModal;