const StatCard = ({ icon: Icon, title, value, subtitle, color }) => {
  return <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="p-3 rounded-full"  style={{ backgroundColor: color + '20' }}>
        <Icon size={24} style={{color}}/>
      </div>
    </div>
  </div>;
};

export default StatCard;
