import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function Dropdown({ classfield, label, name, value, onChange, selectmessage, options, children, disabled=false, allowEmpty =true }){
  const [open, setOpen] = useState(false);

  const handleSelect = (val) => {
    onChange({ target: { name, value: val}});
    setOpen(false);
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label || (allowEmpty ? selectmessage || "Select an option" : "");
  return(
    <div>
      {/* <label className="block text-sm font-medium">{label}</label> */}
      <div className="relative" tabIndex={0} onBlur={() => setOpen(false)}>
        <button type="button" disabled={disabled}  onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-1 w-full py-2 px-4 border-3 rounded-xs drop-shadow-[4px_4px_0_rgba(0,0,0,1)] bg-white font-medium hover:drop-shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-yellow-500 transition">
          {selectedLabel}
          <ChevronDown size={20}/>
        </button>
        {open && (
          <ul className="absolute z-10 mt-1 w-full min-w-50 bg-white border-3 rounded-sm drop-shadow-[5px_5px_0_rgba(0,0,0,1)] font-bold text-sm">
            {allowEmpty && (
              <li onMouseDown={() => handleSelect("")}  className="m-2 hover:bg-yellow-500 rounded-sm cursor-pointer transition">
                {selectmessage || "Select an option"}
              </li>
            )}
            {options.map((opt) => (
              <li key={opt.value} onMouseDown={() => handleSelect(opt.value)} className="px-4 py-2 m-1 hover:bg-yellow-500 rounded-sm cursor-pointer transition">
                {opt.label}
              </li>
            ))}
          </ul>
        )}
        { children && children }
        
      </div>
    </div>
  );
}