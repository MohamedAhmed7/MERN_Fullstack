import './App.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar />
        <Landing />
        <Footer />
      </header>
    </div>
  );
}

export default App;
