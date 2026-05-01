import { useState } from 'react';

function AdminPage({ hospitals, onUpdateStock }) {
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [units, setUnits] = useState('');
  const [selectedComponents, setSelectedComponents] = useState(['Whole Blood']);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const componentTypes = ['Whole Blood', 'Red Cells', 'Platelets', 'Plasma'];

  const toggleComponent = (type) => {
    if (selectedComponents.includes(type)) {
      setSelectedComponents(selectedComponents.filter(t => t !== type));
    } else {
      setSelectedComponents([...selectedComponents, type]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedHospitalId || !selectedBloodGroup || units === '' || selectedComponents.length === 0) {
      alert("Please fill in all fields and select at least one component.");
      return;
    }
    
    // Pass the full details to the parent
    onUpdateStock(selectedHospitalId, selectedBloodGroup, selectedComponents, Number(units));
    alert("Stock updated successfully!");
    
    // Reset form
    setSelectedHospitalId('');
    setSelectedBloodGroup('');
    setUnits('');
    setSelectedComponents(['Whole Blood']);
  };

  return (
    <div className="page admin-page">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 className="page-title">Update Blood Stock</h1>
        <p className="text-center" style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
          Log new incoming units or adjust current inventory levels across regional facilities.
        </p>

        <form className="card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Facility</label>
            <select 
              className="form-select" 
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
            >
              <option value="" disabled>Choose a location...</option>
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select 
                className="form-select"
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
              >
                <option value="" disabled>Select type...</option>
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Units (Pints)</label>
              <input 
                type="number" 
                min="0" 
                className="form-input" 
                placeholder="e.g., 5" 
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            <label className="form-label text-center" style={{ marginBottom: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>Component Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {componentTypes.map(type => {
                const isSelected = selectedComponents.includes(type);
                return (
                  <button 
                    key={type}
                    type="button" 
                    className="btn" 
                    onClick={() => toggleComponent(type)}
                    style={{ 
                      border: isSelected ? '2px solid var(--primary-red)' : '1px solid var(--border-color)', 
                      color: isSelected ? 'var(--primary-red)' : 'var(--text-light)', 
                      backgroundColor: isSelected ? '#ffebee' : 'transparent', 
                      fontSize: '0.8rem', 
                      padding: '0.5rem',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Update Stock
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminPage;
