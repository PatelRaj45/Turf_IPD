import app from './app.js';

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});