// This is a modal used in Editor to save projects to database.
import React, { useState } from "react";
import Modal from "../layouts/ModalLayout";

const SaveModal = ({isOpen, onClose, onSave, initialTitle='', initialDescription=''}) => {
  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const [projectDescription, setProjectDescription] = useState(initialDescription);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ title: projectTitle, description: projectDescription });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex flex-1 flex-col space-y-2 gap-2">
          <h3 className="text-2xl font-bold mb-4">Save Project</h3>
          <input type="text" placeholder="Project Title" value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"/>
          <textarea placeholder="Description (optional)" value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"/>
          <div className="flex gap-3">
            <button onClick={handleSave} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition">
              Save
            </button>
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;
