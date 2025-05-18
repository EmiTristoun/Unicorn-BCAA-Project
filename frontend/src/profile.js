import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const token = localStorage.getItem('token');
  let currentUserId = null;
  if (token) {
    try {
      currentUserId = JSON.parse(atob(token.split('.')[1])).id;
    } catch {
      currentUserId = null;
    }
  }

  useEffect(() => {
    fetch(`https://backend-absolute-cinema.onrender.com/user/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch user'))
      .then(data => setUser(data))
      .catch(() => setError('Failed to fetch user info.'));

    fetch(`https://backend-absolute-cinema.onrender.com/list/*`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch lists'))
      .then(data => setLists(data.filter(list => list.user_id === Number(id))))
      .catch(() => setError('Failed to fetch lists.'));
  }, [id]);

  const handleDisconnect = () => {
    localStorage.removeItem('token');
    navigate('/homepage');
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('You must be logged in to create a list.');
      return;
    }
    try {
      const response = await fetch('https://backend-absolute-cinema.onrender.com/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newListName,
          user_id: currentUserId,
        }),
      });
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }
      setShowCreateForm(false);
      setNewListName('');
      fetch(`https://backend-absolute-cinema.onrender.com/list/*`)
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch lists'))
        .then(data => setLists(data.filter(list => list.user_id === Number(id))))
        .catch(() => setError('Failed to fetch lists.'));
    } catch (err) {
      setError('Failed to create list.');
    }
  };

  if (error) {
    return <div style={{ paddingTop: '60px', color: 'red' }}>{error}</div>;
  }

  if (!user) {
    return <div style={{ paddingTop: '60px' }}>Loading profile...</div>;
  }

  return (
    <div style={{ paddingTop: '60px', maxWidth: 600, margin: '0 auto' }}>
      <h1>Profile</h1>
      <div style={{ marginBottom: 30 }}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      {currentUserId && Number(currentUserId) === Number(id) && (
        <div style={{ textAlign: 'center', margin: '30px 0', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button
            onClick={handleDisconnect}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Disconnect
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {showCreateForm ? 'Cancel' : 'Create List'}
          </button>
        </div>
      )}
      {showCreateForm && currentUserId && Number(currentUserId) === Number(id) && (
        <form onSubmit={handleCreateList} style={{ marginBottom: 30, textAlign: 'center' }}>
          <input
            type="text"
            placeholder="List name"
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            required
            style={{ marginRight: 10, padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button
            type="submit"
            style={{
              padding: '5px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Create
          </button>
        </form>
      )}
      <h2>{Number(currentUserId) === Number(id) ? 'Your Lists' : `${user.name}'s Lists`}</h2>
      {lists.length === 0 ? (
        <p>No lists found.</p>
      ) : (
        <ul>
          {lists.map(list => (
            <li key={list.id}>
              <strong
                style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => navigate(`/list/${list.id}`)}
              >
                {list.name}
              </strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Profile;