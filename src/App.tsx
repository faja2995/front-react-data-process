import './App.css';
import { useRoutes } from 'react-router-dom';
import CSVShow from './components/CSVShow/CSVShow.tsx';
import DropFileInput from './components/DropFileInput/DropFileInput.tsx';

function App() {
  const routes = useRoutes([
    { path: '/', element: <DropFileInput /> },
    { path: 'csv', element: <CSVShow /> },
  ]);

  return routes;
}

export default App;
