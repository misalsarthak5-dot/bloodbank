import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

function AdminPage({ hospitals, onUpdateStock, onRefresh }) {
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('');
  const [units, setUnits] = useState('');
  const [selectedComponents, setSelectedComponents] = useState(['Whole Blood']);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // New state for Action Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const componentTypes = ['Whole Blood', 'Red Cells', 'Platelets', 'Plasma'];

  const fetchRequests = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select(`
          *,
          hospitals (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err.message);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    setLoadingRequests(true);
    try {
      // Fetch both hospitals (via parent) and requests (locally)
      await Promise.all([
        onRefresh(), // Refetches hospitals and inventory in App.jsx
        fetchRequests() // Refetches blood requests
      ]);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching data:', err.message);
    } finally {
      setIsRefreshing(false);
      setLoadingRequests(false);
    }
  }, [onRefresh, fetchRequests]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (requestId, newStatus) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('blood_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      
      alert(`Request ${newStatus} successfully!`);
      setShowActionModal(false);
      fetchData(); // Refresh everything after update
    } catch (err) {
      console.error('Error updating request:', err.message);
      alert('Failed to update request: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const openActionModal = (request) => {
    setSelectedRequest(request);
    setShowActionModal(true);
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fff3e0', text: '#ef6c00' };
      case 'accepted': return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'rejected': return { bg: '#ffebee', text: '#c62828' };
      default: return { bg: '#f5f5f5', text: '#757575' };
    }
  };

  return (
    <div className="page admin-page">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={fetchData} 
            disabled={isRefreshing}
            style={{ 
              background: 'white', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              opacity: isRefreshing ? 0.7 : 1
            }}
          >
            <span style={{ fontSize: '1.1rem', transition: 'transform 0.5s ease', transform: isRefreshing ? 'rotate(360deg)' : 'none' }}>&#8635;</span>
            {isRefreshing ? 'Syncing...' : 'Refresh Data'}
          </button>
        </div>
        
        <div className="grid grid-cols-1" style={{ gap: '3rem' }}>
          {/* Update Stock Form */}
          <section>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Update Blood Stock</h2>
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
          </section>

          {/* Active Requests Table */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', margin: 0 }}>Active Blood Requests</h2>
            </div>
            
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {loadingRequests ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>Loading requests...</div>
              ) : requests.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>No active requests found.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f9f9f9', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Patient Details</th>
                        <th style={{ padding: '1rem' }}>Facility</th>
                        <th style={{ padding: '1rem' }}>Group / Component</th>
                        <th style={{ padding: '1rem' }}>Units</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                        <th style={{ padding: '1rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map(req => {
                        const colors = getStatusColor(req.status);
                        return (
                          <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem' }}>
                              <div style={{ fontWeight: '500' }}>{req.notes?.split('|')[0]?.replace('Patient: ', '') || 'N/A'}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{req.notes?.split('|')[1]?.trim() || 'No Contact'}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>{req.hospitals?.name || 'Unknown'}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ color: 'var(--primary-red)', fontWeight: 'bold' }}>{req.blood_group}</span>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{req.component_type}</div>
                            </td>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{req.units_needed}</td>
                            <td style={{ padding: '1rem' }}>
                              <span style={{ 
                                padding: '0.25rem 0.5rem', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem', 
                                backgroundColor: colors.bg,
                                color: colors.text,
                                fontWeight: '600',
                                textTransform: 'uppercase'
                              }}>
                                {req.status}
                              </span>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <button 
                                className="btn" 
                                onClick={() => openActionModal(req)}
                                style={{ 
                                  padding: '0.4rem 0.75rem', 
                                  fontSize: '0.75rem', 
                                  background: 'var(--primary-red)', 
                                  color: 'white' 
                                }}
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {showActionModal && selectedRequest && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(4px)'
        }}>
          <div className="modal-content" style={{
            background: 'white', padding: '2rem', borderRadius: '16px',
            width: '100%', maxWidth: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Review Blood Request</h3>
              <button onClick={() => setShowActionModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#999' }}>&times;</button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#666' }}>Patient Name</p>
                <p style={{ margin: 0, fontWeight: '600' }}>{selectedRequest.notes?.split('|')[0]?.replace('Patient: ', '') || 'N/A'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#666' }}>Requirement</p>
                  <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary-red)' }}>{selectedRequest.blood_group}</p>
                  <p style={{ margin: 0, fontSize: '0.8rem' }}>{selectedRequest.component_type}</p>
                </div>
                <div style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#666' }}>Units Needed</p>
                  <p style={{ margin: 0, fontWeight: '600', fontSize: '1.25rem' }}>{selectedRequest.units_needed}</p>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem', textAlign: 'center' }}>
              Would you like to accept or reject this blood request for <strong>{selectedRequest.hospitals?.name}</strong>?
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn" 
                disabled={isUpdating}
                onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                style={{ 
                  flex: 1, 
                  background: '#fff', 
                  border: '1px solid #c62828', 
                  color: '#c62828',
                  opacity: isUpdating ? 0.5 : 1
                }}
              >
                Reject
              </button>
              <button 
                className="btn" 
                disabled={isUpdating}
                onClick={() => handleStatusUpdate(selectedRequest.id, 'accepted')}
                style={{ 
                  flex: 1, 
                  background: '#2e7d32', 
                  color: 'white',
                  opacity: isUpdating ? 0.5 : 1
                }}
              >
                {isUpdating ? 'Processing...' : 'Accept Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
