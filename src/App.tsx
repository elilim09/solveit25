import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './page/Home';
import Login from './page/Login';
import Signup from './page/Signup';
import Settings from './page/Settings';
import ChangePassword from './page/ChangePassword';
import ProblemBoard from './page/ProblemBoard';
import ProblemDetail from './page/ProblemDetail';
import CreateProblem from './page/CreateProblem';
import EditProblem from './page/EditProblem';
import CommunityBoard from './page/CommunityBoard';
import CommunityDetail from './page/CommunityDetail';
import CreateCommunity from './page/CreateCommunity';
import EditCommunity from './page/EditCommunity';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/change-password" element={<ChangePassword />} />  
        <Route path="/problem-board" element={<ProblemBoard />} />
        <Route path="/problem/:id" element={<ProblemDetail />} />
        <Route path="/create-problem" element={<CreateProblem />} />
        <Route path="/edit-problem/:id" element={<EditProblem />} />
        <Route path="/community-board" element={<CommunityBoard />} />
        <Route path="/community/:id" element={<CommunityDetail />} />
        <Route path="/create-community" element={<CreateCommunity />} />
        <Route path="/edit-community/:id" element={<EditCommunity />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;

