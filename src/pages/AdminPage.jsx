import { useState } from 'react';

function AdminPage({ 
  hospitals, 
  onUpdateStock, 
  bloodRequests, 
  onUpdateRequestStatus, 
  onRefreshRequests 
}) {
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [units, setUnits] = useState('');
  const [selectedComponents, setSelectedComponents] = useState(['Whole Blood']);
  const [activeTab, setActiveTab] = useState('inventory');

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
    onUpdateStock(selectedHospitalId, selectedBloodGroup, selectedComponents, Number(units));
    alert("Stock updated successfully!");
    setSelectedHospitalId('');
    setSelectedBloodGroup('');
    setUnits('');
    setSelectedComponents(['Whole Blood']);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'matched': return '#3498db';
      case 'fulfilled': return '#27ae60';
      default: return '#7f8c8d';
    }
  };

  // Helper to check stock for a specific request
  const checkStockForRequest = (req) => {
    const hospital = hospitals.find(h => h.id === req.hospital_id);
    if (!hospital || !hospital.rawInventory) return 0;
    
    // Sum up matching inventory rows
    return hospital.rawInventory
      .filter(inv => inv.blood_group === req.blood_group && inv.component_type === req.component_type)
      .reduce((sum, inv) => sum + (inv.units_available || 0), 0);
  };

  return (
    <div className="page admin-page">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 className="page-title">Admin Control Center</h1>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          <button className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('inventory')} style={{ width: '200px' }}>Update Inventory</button>
          <button className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveTab('requests'); onRefreshRequests(); }} style={{ width: '200px' }}>Manage Requests</button>
        </div>

        {activeTab === 'inventory' ? (
          <form className="card" onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>Update Blood Stock</h2>
            <div className="form-group">
              <label className="form-label">Select Facility</label>
              <select className="form-select" value={selectedHospitalId} onChange={(e) => setSelectedHospitalId(e.target.value)}>
                <option value="" disabled>Choose a location...</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} ({h.type})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-select" value={selectedBloodGroup} onChange={(e) => setSelectedBloodGroup(e.target.value)}>
                  <option value="" disabled>Select type...</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units (Pints)</label>
                <input type="number" min="0" className="form-input" placeholder="e.g., 5" value={units} onChange={(e) => setUnits(e.target.value)} />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
              <label className="form-label text-center" style={{ marginBottom: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>Component Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {componentTypes.map(type => (
                  <button key={type} type="button" className="btn" onClick={() => toggleComponent(type)} style={{ border: selectedComponents.includes(type) ? '2px solid var(--primary-red)' : '1px solid var(--border-color)', color: selectedComponents.includes(type) ? 'var(--primary-red)' : 'var(--text-light)', backgroundColor: selectedComponents.includes(type) ? '#ffebee' : 'transparent', fontSize: '0.8rem', padding: '0.5rem', transition: 'all 0.2s ease-in-out' }}>{type}</button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Update Stock</button>
          </form>
        ) : (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Active Blood Requests</h2>
              <button className="btn btn-secondary" onClick={onRefreshRequests} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Refresh Data</button>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>Patient / Notes</th>
                    <th style={{ padding: '1rem' }}>Facility</th>
                    <th style={{ padding: '1rem' }}>Blood Group / Type</th>
                    <th style={{ padding: '1rem' }}>Units Needed</th>
                    <th style={{ padding: '1rem' }}>Stock Available</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodRequests.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>No requests found.</td></tr>
                  ) : (
                    bloodRequests.map(req => {
                      const available = checkStockForRequest(req);
                      const isInsufficient = available < req.units_needed;
                      return (
                        <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem' }}>{req.notes || 'No details'}</td>
                          <td style={{ padding: '1rem' }}>{req.hospitals?.name || 'Unknown'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ color: 'var(--primary-red)', fontWeight: 'bold' }}>{req.blood_group}</span>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{req.component_type}</div>
                          </td>
                          <td style={{ padding: '1rem' }}>{req.units_needed}</td>
                          <td style={{ padding: '1rem', color: isInsufficient ? 'var(--primary-red)' : 'inherit', fontWeight: isInsufficient ? 'bold' : 'normal' }}>
                            {available} {isInsufficient && <span style={{fontSize: '0.7rem'}}>(LOW)</span>}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', background: getStatusColor(req.status) + '22', color: getStatusColor(req.status), fontWeight: '600', textTransform: 'uppercase' }}>{req.status}</span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              {req.status === 'pending' && <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#3498db' }} onClick={() => onUpdateRequestStatus(req.id, 'matched')}>Match</button>}
                              {(req.status === 'pending' || req.status === 'matched') && (
                                <button 
                                  className="btn btn-primary" 
                                  style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: isInsufficient ? '#bdc3c7' : '#27ae60' }} 
                                  disabled={isInsufficient}
                                  onClick={() => onUpdateRequestStatus(req.id, 'fulfilled')}
                                >
                                  Fulfill
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
