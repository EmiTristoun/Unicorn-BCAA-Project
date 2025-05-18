const BASE_URL = 'https://backend-absolute-cinema.onrender.com';

export const getVersion = async () => {
    const response = await fetch(`${BASE_URL}/version`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
};

/* function getVersion() {
    const response = fetch(`${BASE_URL}/version`);
    return response.then(res => res.text());
} */

/* export const createUser = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return response.text();
}; */

/* export default getVersion; */