import { useState, useEffect } from 'react';
import './SearchPage.css';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const componentTypes = ['Whole Blood', 'Red Cells', 'Platelets', 'Plasma'];

function SearchPage({ onSearch }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const toggleComponent = (type) => {
    if (selectedComponents.includes(type)) {
      setSelectedComponents(selectedComponents.filter(t => t !== type));
    } else {
      setSelectedComponents([...selectedComponents, type]);
    }
  };

  const handleSearch = () => {
    if (selectedGroup) {
      onSearch(selectedGroup, selectedComponents);
    } else {
      alert("Please select a blood group");
    }
  };

  // Parallax calculations
  const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
  const rotateX = centerY ? ((mousePos.y - centerY) / centerY) * -4 : 0;
  const rotateY = centerX ? ((mousePos.x - centerX) / centerX) * 4 : 0;

  return (
    <div className="page search-page">
      <div className="vignette" />
      <div className="bg-shape shape-1" />
      <div className="bg-shape shape-2" />
      <div className="bg-glow" />

      <div 
        className="cursor-glow" 
        style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }} 
      />
      
      <div className="search-content fade-in">
        <h1 className="page-title hero-title">Find Blood Availability</h1>
        <p className="subtitle text-center">
          Select a blood group to quickly scan regional inventory levels.
        </p>

        <div 
          className="search-card card elevated-card"
          style={{
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <h3 className="section-heading">Select Blood Group</h3>
          
          <div className="blood-group-grid">
            {bloodGroups.map((bg) => (
              <button 
                key={bg}
                className={`blood-group-btn ${selectedGroup === bg ? 'selected' : ''}`}
                onClick={() => setSelectedGroup(bg)}
              >
                {bg}
              </button>
            ))}
          </div>

          <h3 className="section-heading mt-large">Select Component Type</h3>
          <div className="component-grid">
            {componentTypes.map(type => {
              const isSelected = selectedComponents.includes(type);
              return (
                <button 
                  key={type}
                  type="button" 
                  className={`component-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleComponent(type)}
                >
                  {type}
                </button>
              );
            })}
          </div>

          <button className="btn btn-primary search-btn" onClick={handleSearch}>
            Search Availability
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
