import React, { useEffect, useState } from 'react';
import {getVersion} from './api';

function App() {
  const [version, setVersion] = useState(''); // State to store the version

  useEffect(() => {
    getVersion()
      .then((data) => {
        console.log('Fetched version:', data); // Debugging log
        setVersion(data); // Update the state with the fetched version
      })
      .catch((error) => console.error('Error fetching version:', error));
  }, []);

  return (
    <div>
      <h1>Absolute Cinema</h1>
      <p>Backend Version: {version}</p>
    </div>
  );
}

export default App;