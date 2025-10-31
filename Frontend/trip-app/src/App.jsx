import { Route, Routes } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import HomePage from './pages/HomePage';
import CompilationPage from './pages/CompilationPage';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <>
      <NavigationBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/compilation" element={<CompilationPage />} />
      </Routes>
    </>
  );
}

export default App;