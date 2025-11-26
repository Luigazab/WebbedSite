import { Upload, Trash2 } from "lucide-react";

const LoadModal = ({ isOpen, onClose, projects, onLoadProject, onDeleteProject, }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-auto">
        <h3 className="text-2xl font-bold mb-4">Load Project</h3>
        {projects.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No saved projects yet
          </p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{project.title}</h4>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {project.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onLoadProject(project)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      <Upload size={18} />
                    </button>
                    <button onClick={() => onDeleteProject(project.id)} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
          Close
        </button>
      </div>
    </div>
  );
};

export default LoadModal;
