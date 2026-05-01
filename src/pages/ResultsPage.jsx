import { useState } from 'react';
import './ResultsPage.css';

function ResultsPage({ hospitals, searchQuery, onBack, onSubmitRequest }) {
  const { bloodGroup, components } = searchQuery;
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [patientName, setPatientName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [requiredUnits, setRequiredUnits] = useState(1);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [paymentOption, setPaymentOption] = useState('hospital');

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesBloodGroup = !bloodGroup || (hospital.bloodGroups && hospital.bloodGroups.includes(bloodGroup));
    const matchesComponents = !components || components.length === 0 || 
      components.every(c => hospital.components && hospital.components.includes(c));
    return matchesBloodGroup && matchesComponents;
  });

  const getStatusInfo = (units) => {
    if (units === 0) return { label: 'EMPTY', class: 'status-empty' };
    if (units < 5) return { label: 'CRITICAL', class: 'status-critical' };
    return { label: 'AVAILABLE', class: 'status-available' };
  };

  const openModal = (hospital) => {
    setSelectedHospital(hospital);
    setPatientName('');
    setContactNumber('');
    setRequiredUnits(1);
    setSelectedComponent(components?.length > 0 ? components[0] : 'Whole Blood');
    setPaymentOption('hospital');
    setRequestError('');
    setShowModal(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setRequestError('');
    setIsSubmitting(true);

    try {
      // Validate units
      if (requiredUnits < 1) {
        setRequestError('Please request at least 1 unit.');
        setIsSubmitting(false);
        return;
      }

      if (requiredUnits > selectedHospital.units) {
        setRequestError(`Not enough units available. Only ${selectedHospital.units} units in stock.`);
        setIsSubmitting(false);
        return;
      }

      // Submit to backend
      const result = await onSubmitRequest({
        hospitalId: selectedHospital.id,
        bloodGroup: bloodGroup || 'O+',
        componentType: selectedComponent || 'Whole Blood',
        unitsNeeded: requiredUnits,
        patientName,
        contactNumber,
      });

      if (result.success) {
        setShowModal(false);
        setShowSuccess(true);
      } else {
        setRequestError(result.error || 'Failed to submit request. Please try again.');
      }
    } catch (err) {
      setRequestError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page results-page">
      <div className="results-header">
        <button className="btn btn-back" onClick={onBack}>&larr; Back to Search</button>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
            Regional Availability: <span style={{ color: 'var(--primary-red)' }}>{bloodGroup}</span> Blood
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
            {components && components.length > 0 
              ? `Showing inventory for: ${components.join(', ')}.` 
              : 'Real-time inventory levels across all connected medical facilities.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 mt-2">
        {filteredHospitals.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
            No facilities match your specific requirements at this time.
          </div>
        ) : (
          filteredHospitals.map((hospital) => {
            const status = getStatusInfo(hospital.units);
          return (
            <div key={hospital.id} className={`card hospital-card ${status.class}`}>
              <div className="card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 className="hospital-name" style={{ marginBottom: 0 }}>{hospital.name}</h3>
                    <span className={`type-badge type-${(hospital.type || 'unknown').replace(' ', '-').toLowerCase()}`}>
                      {hospital.type || 'Unknown'}
                    </span>
                  </div>
                  <p className="hospital-distance">{hospital.distance}</p>
                </div>
                <span className={`status-badge ${status.class}`}>{status.label}</span>
              </div>
              
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className={`units-display ${status.class}`}>
                  <span className="units-number">{hospital.units}</span>
                  <span className="units-label">UNITS</span>
                </div>

                {hospital.components && hospital.components.length > 0 && (
                  <div className="component-tags">
                    {hospital.components.map(comp => (
                      <span 
                        key={comp} 
                        className={`component-tag ${components && components.includes(comp) ? 'matched' : ''}`}
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                )}
                
                {hospital.units === 0 ? (
                  <button className="btn btn-secondary request-btn disabled" disabled>
                    Currently Unavailable
                  </button>
                ) : (
                  <button className="btn btn-primary request-btn" onClick={() => openModal(hospital)}>
                    Request Blood
                  </button>
                )}
              </div>

              <div className="card-footer">
                <span className="last-updated">
                  &#8635; Updated: {hospital.lastUpdated}
                </span>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Request Modal */}
      {showModal && selectedHospital && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Blood</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmitRequest} className="request-form">
              <div className="form-group">
                <label className="form-label">Hospital / Facility</label>
                <input type="text" className="form-input disabled-input" value={selectedHospital.name} disabled />
              </div>
              
              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input type="text" className="form-input disabled-input" value={bloodGroup || 'Not Specified'} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Component</label>
                  <select 
                    className="form-select" 
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value)}
                  >
                    {(selectedHospital.components && selectedHospital.components.length > 0 
                      ? selectedHospital.components 
                      : ['Whole Blood']
                    ).map(comp => (
                      <option key={comp} value={comp}>{comp}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={patientName} 
                  onChange={(e) => setPatientName(e.target.value)} 
                  required 
                  placeholder="Enter full patient name"
                />
              </div>

              <div className="grid-2-col">
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    value={contactNumber} 
                    onChange={(e) => setContactNumber(e.target.value)} 
                    required 
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Required Units</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={requiredUnits} 
                    onChange={(e) => setRequiredUnits(Number(e.target.value))} 
                    required 
                    min="1"
                    max={selectedHospital.units}
                  />
                </div>
              </div>

              {/* Error Display */}
              {requestError && (
                <div className="request-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  {requestError}
                </div>
              )}

              <div className="service-charges-banner">
                <h4 style={{ marginBottom: '0.25rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Service Charges</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.75rem' }}>Charges may apply for processing, testing, and handling.</p>
                <div className="payment-options">
                  <label className="radio-label">
                    <input type="radio" name="payment" checked={paymentOption === 'hospital'} onChange={() => setPaymentOption('hospital')} />
                    <span>Pay at Hospital</span>
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="payment" checked={paymentOption === 'online'} onChange={() => setPaymentOption('online')} />
                    <span>Online Payment (Optional)</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ background: 'transparent', color: 'var(--text-light)', border: '1px solid var(--border-color)' }}>Cancel</button>
                <button 
                  type="submit" 
                  className="btn btn-primary confirm-btn" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <div className="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Request Submitted</h3>
            <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '2rem' }}>
              Your request has been successfully sent to the facility. They will contact you shortly regarding the collection process.
            </p>
            <button className="btn btn-primary" onClick={() => setShowSuccess(false)} style={{ width: '100%', padding: '0.75rem' }}>
              Back to Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
