export default function Dropdown({ classfield, label, name, value, onChange, selectmessage, options, children, disabled=false, allowEmpty =true }){
  return(
    <div className={classfield}>
      <label className="block text-sm font-medium">{label}</label>
      <div className={classfield}>
        <select name={name} value={value} onChange={onChange} disabled={disabled} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
          {allowEmpty && (
            <option value="">
              {selectmessage || "Select an option"}
            </option>
          )}
          {!allowEmpty && (
            <option value="" disabled hidden>
              {selectmessage || "Select an option"}
            </option>
          )}
          {options.map((opt) =>(
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        { children && children }
      </div>
    </div>
  );
}