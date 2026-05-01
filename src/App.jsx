import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import SearchPage from './pages/SearchPage'
import ResultsPage from './pages/ResultsPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import './index.css'

const allComponents = ['Whole Blood', 'Red Cells', 'Platelets', 'Plasma'];
const allBloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

// Fallback data used when Supabase tables are empty or unavailable
const fallbackHospitals = [
  { id: 1, name: 'Jeevan Adhar Blood Bank – Vazirabad', type: 'Blood Bank', units: 14, distance: '2.4 km away', lastUpdated: '2 mins ago', components: ['Whole Blood', 'Red Cells', 'Platelets'], bloodGroups: allBloodGroups },
  { id: 2, name: 'Guru Gobind Singh Blood Center – Shivaji Nagar', type: 'Blood Bank', units: 2, distance: '5.1 km away', lastUpdated: 'Just Now', components: ['Whole Blood', 'Plasma'], bloodGroups: ['A+', 'O+', 'B+'] },
  { id: 3, name: 'Shree Hajur Saheb Blood Bank – Guru Gobind Singh Road', type: 'Blood Bank', units: 6, distance: '8.7 km away', lastUpdated: '15 mins ago', components: ['Red Cells', 'Platelets'], bloodGroups: ['A-', 'O-', 'AB-'] },
  { id: 4, name: 'Nanded Blood Bank – Aadhar Hospital Road', type: 'Blood Bank', units: 0, distance: '12.0 km away', lastUpdated: '1 hour ago', components: allComponents, bloodGroups: allBloodGroups },
  { id: 5, name: 'Golvalkar Guruji Blood Bank – Langer Saheb Road', type: 'Blood Bank', units: 25, distance: '3.5 km away', lastUpdated: '5 mins ago', components: ['Whole Blood', 'Red Cells', 'Plasma'], bloodGroups: ['O+', 'A+', 'AB+'] },
  { id: 6, name: 'Jijai Blood Centre – Shivaji Nagar', type: 'Blood Bank', units: 8, distance: '4.2 km away', lastUpdated: '10 mins ago', components: ['Platelets'], bloodGroups: ['B+', 'B-', 'AB+'] },
  { id: 7, name: 'Aadhar Hospital – Nanded', type: 'Hospital', units: 3, distance: '6.0 km away', lastUpdated: '30 mins ago', components: ['Whole Blood'], bloodGroups: ['O+', 'O-'] },
  { id: 8, name: 'Global Hospital – Nanded', type: 'Hospital', units: 12, distance: '1.5 km away', lastUpdated: '1 min ago', components: ['Whole Blood', 'Plasma', 'Red Cells'], bloodGroups: allBloodGroups },
  { id: 9, name: 'Life Care Hospital – Nanded', type: 'Hospital', units: 0, distance: '7.8 km away', lastUpdated: '2 hours ago', components: ['Red Cells'], bloodGroups: ['A+', 'B+'] },
];

function App() {
  const [currentPage, setCurrentPage] = useState('search');
  const [hospitals, setHospitals] = useState(fallbackHospitals);
  const [searchQuery, setSearchQuery] = useState({ bloodGroup: '', components: [] });
  const [user, setUser] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);

  // Fetch hospitals and inventory from Supabase on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const { data, error } = await supabase
          .from('hospitals')
          .select('*, blood_inventory(*)');
        
        if (error) {
          console.warn('Supabase fetch error, using local data:', error.message);
          return;
        }

        if (data && data.length > 0) {
          // Transform Supabase data to match our frontend format
          const transformed = data.map(h => ({
            id: h.id,
            name: h.name,
            type: h.is_verified ? 'Hospital' : 'Blood Bank',
            units: h.blood_inventory?.reduce((sum, inv) => sum + (inv.units_available || 0), 0) || 0,
            distance: `${(Math.random() * 12 + 1).toFixed(1)} km away`,
            lastUpdated: h.last_updated ? new Date(h.last_updated).toLocaleString() : 'Unknown',
            // components = unique component_type values (Whole Blood, Red Cells, Platelets, Plasma)
            components: [...new Set((h.blood_inventory || []).map(inv => inv.component_type).filter(Boolean))],
            // bloodGroups = unique blood group values (A+, B-, etc.)
            bloodGroups: [...new Set((h.blood_inventory || []).map(inv => inv.blood_group).filter(Boolean))],
            address: h.address,
            city: h.city,
          }));
          setHospitals(transformed);
          setDbConnected(true);
        } else {
          console.info('No hospitals in DB yet, using fallback data.');
        }
      } catch (err) {
        console.warn('Could not connect to Supabase:', err.message);
      }
    };

    fetchHospitals();
  }, []);

  const navigateTo = (page) => {
    if (page === 'admin' && user?.role !== 'Admin') {
      alert("Access denied. Please login as admin.");
      setUser(null);
      return;
    }
    setCurrentPage(page);
  };

  const handleLogin = async (userData) => {
    // Try to authenticate against Supabase users/admins tables
    try {
      if (userData.role === 'Admin') {
        const { data } = await supabase
          .from('admins')
          .select('*')
          .eq('email', userData.email)
          .single();
        
        if (data) {
          setUser({ ...userData, dbId: data.id, name: data.name });
          setCurrentPage('admin');
          return;
        }
      } else {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('email', userData.email)
          .single();
        
        if (data) {
          setUser({ ...userData, dbId: data.id, name: data.name });
          setCurrentPage('search');
          return;
        }
      }
    } catch (err) {
      console.warn('DB auth lookup failed, using local auth:', err.message);
    }

    // Fallback to local hardcoded auth
    setUser(userData);
    if (userData.role === 'Admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('search');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('search');
  };

  const updateStock = async (hospitalId, bloodGroup, componentTypes, newUnits) => {
    // If connected, sync to Supabase
    if (dbConnected) {
      try {
        // We perform an upsert for each selected component type
        const updates = componentTypes.map(compType => ({
          hospital_id: hospitalId,
          blood_group: bloodGroup,
          component_type: compType,
          units_available: newUnits,
          status: newUnits > 5 ? 'available' : (newUnits > 0 ? 'critical' : 'out_of_stock'),
          last_updated_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('blood_inventory')
          .upsert(updates, { onConflict: 'hospital_id,blood_group,component_type' });

        if (error) throw error;
        
        // Re-fetch everything to ensure UI is perfectly in sync with DB calculations
        const { data } = await supabase
          .from('hospitals')
          .select(`*, blood_inventory (*)`);
        
        if (data) {
          const transformed = data.map(h => ({
            id: h.id,
            name: h.name,
            type: h.is_verified ? 'Hospital' : 'Blood Bank',
            units: h.blood_inventory?.reduce((sum, inv) => sum + (inv.units_available || 0), 0) || 0,
            distance: `${(Math.random() * 12 + 1).toFixed(1)} km away`,
            lastUpdated: h.last_updated ? new Date(h.last_updated).toLocaleString() : 'Just Now',
            components: [...new Set((h.blood_inventory || []).map(inv => inv.component_type).filter(Boolean))],
            bloodGroups: [...new Set((h.blood_inventory || []).map(inv => inv.blood_group).filter(Boolean))],
            address: h.address,
            city: h.city,
          }));
          setHospitals(transformed);
        }
      } catch (err) {
        console.error('Database update failed:', err.message);
        alert("Failed to sync with database: " + err.message);
      }
    } else {
      // Fallback local update (simplified)
      setHospitals(hospitals.map(h => 
        h.id === hospitalId ? { ...h, units: newUnits, lastUpdated: 'Just Now' } : h
      ));
    }
  };

  const handleSearch = (bloodGroup, components) => {
    setSearchQuery({ bloodGroup, components });
    navigateTo('results');
  };

  if (!user) {
    return (
      <>
        <nav className="navbar">
          <div className="nav-brand">Blood Finder</div>
          <span className="db-status" style={{ fontSize: '0.75rem', color: dbConnected ? '#4caf50' : '#9e9e9e' }}>
            {dbConnected ? '● DB Connected' : '● Local Mode'}
          </span>
        </nav>
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">Blood Finder</div>
        <div className="nav-links">
          <span className="db-status" style={{ fontSize: '0.75rem', color: dbConnected ? '#4caf50' : '#9e9e9e', marginRight: '0.5rem' }}>
            {dbConnected ? '● DB Connected' : '● Local Mode'}
          </span>
          <a 
            className={currentPage === 'search' || currentPage === 'results' ? 'active' : ''} 
            onClick={() => navigateTo('search')}
          >
            Live Inventory
          </a>
          <a 
            className={currentPage === 'admin' ? 'active' : ''} 
            onClick={() => navigateTo('admin')}
          >
            Admin Panel
          </a>
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
            Logout
          </a>
        </div>
      </nav>

      <main className="app-container">
        {currentPage === 'search' && <SearchPage onSearch={handleSearch} />}
        {currentPage === 'results' && <ResultsPage hospitals={hospitals} searchQuery={searchQuery} onBack={() => navigateTo('search')} />}
        {currentPage === 'admin' && <AdminPage hospitals={hospitals} onUpdateStock={updateStock} />}
      </main>
    </>
  )
}

export default App
