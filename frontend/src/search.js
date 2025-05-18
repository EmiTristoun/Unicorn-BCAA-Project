import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [films, setFilms] = useState([]);
  const [isFocused, setIsFocused] = useState(false); // Track focus state
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchFilms() {
      try {
        const response = await fetch('https://backend-absolute-cinema.onrender.com/film/*');
        const data = await response.json();
        setFilms(data);
      } catch (error) {
        console.error('Error fetching films:', error);
      }
    }

    fetchFilms();
  }, []);

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query) {
      const filteredSuggestions = films
        .filter((film) => film.title.toLowerCase().includes(query))
        .sort((a, b) => {
          const aStartsWith = a.title.toLowerCase().startsWith(query);
          const bStartsWith = b.title.toLowerCase().startsWith(query);

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return 0;
        })
        .slice(0, 3);

      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (id) => {
    setIsFocused(false);
    navigate(`/film/${id}`);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (searchQuery) {
      setIsFocused(false);
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search for a film..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 100)}
          style={{ margin: '10px', padding: '5px', width: '200px' }}
        />
      </form>
      {isFocused && suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            padding: '10px',
            listStyle: 'none',
            zIndex: 1000,
          }}
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} style={{ padding: '5px 0' }}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSuggestionClick(suggestion.id)}
                style={{
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ccc',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#e0e0e0')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
              >
                {suggestion.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;