import { useState } from 'react';
import { ChevronLeft, ChevronRight, Lightbulb, X, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const TutorialPanel = ({ 
  tutorial, 
  currentStep, 
  steps, 
  onNextStep, 
  onPreviousStep, 
  onExitTutorial,
  isStepComplete 
}) => {
  const [showHint, setShowHint] = useState(false);
  
  if (!tutorial || !steps.length) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex flex-col h-full bg-white border-2 border-black">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 border-b-2 border-black">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold">{tutorial.title}</h2>
          <button 
            onClick={onExitTutorial}
            className="hover:bg-white/20 p-1 rounded transition"
            title="Exit Tutorial"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-purple-100">{tutorial.description}</p>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-100 p-3 border-b border-gray-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
            {tutorial.difficulty_level}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-2 flex-1 rounded-full transition-all ${
                idx < currentStep 
                  ? 'bg-green-500' 
                  : idx === currentStep 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Instruction Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{step.instruction_text}</ReactMarkdown>
        </div>

        {/* Expected Output Preview */}
        {step.expected_output && (
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <p className="text-sm font-semibold text-blue-900 mb-1">Expected Result:</p>
            <p className="text-sm text-blue-700">{step.expected_output}</p>
          </div>
        )}

        {/* Hint Section */}
        {step.hint && (
          <div className="mt-4">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
              >
                <Lightbulb size={16} />
                Need a hint?
              </button>
            ) : (
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <p className="text-sm font-semibold text-yellow-900 mb-1 flex items-center gap-2">
                  <Lightbulb size={16} />
                  Hint:
                </p>
                <p className="text-sm text-yellow-700">{step.hint}</p>
              </div>
            )}
          </div>
        )}

        {/* Completion Status */}
        {isStepComplete && (
          <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-500 rounded flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-sm font-semibold text-green-900">
              Step Complete! Click Next to continue.
            </p>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="border-t-2 border-black p-4 bg-gray-50">
        <div className="flex gap-2 justify-between">
          <button
            onClick={onPreviousStep}
            disabled={isFirstStep}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              isFirstStep
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400 border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]'
            }`}
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          
          <button
            onClick={onNextStep}
            disabled={!isStepComplete}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
              !isStepComplete
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isLastStep
                ? 'bg-green-600 text-white hover:bg-green-700 border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]'
                : 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]'
            }`}
          >
            {isLastStep ? 'Complete' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialPanel;