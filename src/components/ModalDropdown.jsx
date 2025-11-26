
const ModalDropdown = ({label, onClick, onClick2, onClick3, action, action2, action3, description, description2, description3, color}) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-700',
      hover: 'hover:bg-green-800',
      hoverText: 'hover:text-green-950',
      itemHover: 'hover:bg-green-500'
    },
    blue: {
      bg: 'bg-blue-700',
      hover: 'hover:bg-blue-800',
      hoverText: 'hover:text-blue-950',
      itemHover: 'hover:bg-blue-500'
    }
  };

  const colors = colorClasses[color] || colorClasses.green;
  return <div>
    <details className="relative">
      <summary className={`flex items-center justify-between gap-1 w-full py-2 px-4 border-3 rounded-xs drop-shadow-[4px_4px_0_rgba(0,0,0,1)] border-black ${colors.bg} text-white font-medium hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] ${colors.hover} te${colors.hoverText} cursor-pointer transition`}>{label}</summary>
      <div>
        <ul className="absolute right-0 z-10 mt-1 w-full min-w-50 bg-white border-3 rounded-sm drop-shadow-[5px_5px_0_rgba(0,0,0,1)] font-bold text-sm">
          <li className={`px-4 py-2 m-1 ${colors.itemHover} rounded-sm cursor-pointer transition`} onMouseDown={onClick} title={description}>
              {action}
          </li>
          <li className={`px-4 py-2 m-1 ${colors.itemHover} rounded-sm cursor-pointer transition`} onMouseDown={onClick2} title={description2}>
              {action2}
          </li>
          {action3 && (
            <li className={`px-4 py-2 m-1 ${colors.itemHover} rounded-sm cursor-pointer transition`} onMouseDown={onClick3} title={description3}>
                {action3}
            </li>
          )}
        </ul>
      </div>
    </details>
  </div>;
};

export default ModalDropdown;
