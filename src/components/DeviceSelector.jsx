import { Eye, EyeOff } from 'lucide-react';

const DeviceSelector = ({ 
  deviceSizes, 
  responsive, 
  selectedDevice, 
  onToggleResponsive, 
  onSelectDevice 
}) => {
  return (
    <div className='p-1 border-t-2 bg-slate-300'>
      <div className='flex justify-between items-center mb-2'>
        <h5 className='font-semibold'>Screen Sizes:</h5>
        <button 
          onClick={onToggleResponsive} 
          className='flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-gray-900 cursor-pointer transition-colors'
        >
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
      <div className='grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-1 m-1'>
        {Object.entries(deviceSizes).map(([key, device]) => {
          const IconComponent = device.icon;
          const isSelected = responsive && selectedDevice === key;
          return (
            <button 
              key={key} 
              onClick={() => onSelectDevice(key)}
              className={`border-2 border-black flex flex-col items-center rounded-sm hover:drop-shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-2 hover:-translate-x-1 py-2 px-2 md:py-3 transition-all ${
                isSelected 
                  ? 'bg-green-500 text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)] -translate-y-1 -translate-x-1' 
                  : 'bg-white '
              }`}
            >
              <IconComponent size={24} />
              <span className="text-xs mt-1">{device.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DeviceSelector;