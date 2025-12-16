import { X } from 'lucide-react';

const DevicePreviewModal = ({ isOpen, device, deviceSizes, generatedCode, onClose }) => {
  if (!isOpen || !device || device === 'desktop') return null;
  const deviceConfig = deviceSizes[device];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" 
      onClick={onClose}>
        <div className="relative max-w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center gap-4">
            <h3 className="text-white text-2xl font-bold">
              {deviceConfig.label} Preview ({deviceConfig.width}x{deviceConfig.height}px)
            </h3>
            <button onClick={onClose}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
              Close
            </button>
          </div>
          
          <div className="bg-white shadow-2xl border-4 border-gray-800 overflow-hidden rounded-lg"
            style={{
              width: `${deviceConfig.width * deviceConfig.scale}px`,
              height: `${deviceConfig.height * deviceConfig.scale}px`,
              maxWidth: '90vw',
              maxHeight: '80vh'
            }}
          >
            <iframe 
              srcDoc={generatedCode}
              className="border-0"
              title="device-preview"
              sandbox="allow-scripts"
              style={{
                transform: `scale(${deviceConfig.scale})`,
                transformOrigin: 'top left',
                width: `${deviceConfig.width}px`,
                height: `${deviceConfig.height}px`
              }}
            />
          </div>
          
          <div className="mt-4 text-white text-sm">
            <p className="text-center">Click outside to close</p>
          </div>
        </div>
    </div>
  );
}
export default DevicePreviewModal;