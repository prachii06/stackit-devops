import { Routes, Route } from 'react-router-dom';
import Test from './pages/test'; 
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import './App.css';
import AskQuestion from './pages/AskQuestion';
import Answers from './pages/Answers';
import QuestionDetail from './pages/QuestionDetail';
import Notifications from './pages/Notifications';

function App() {
  return (
    <Routes>
      <Route path="/test" element={<Test />} />
      <Route path="/" element={<Home />}/>
      <Route path="signup" element={<Signup />} />
      <Route path="login" element={<Login />} />
      <Route path='askquestion' element = {<AskQuestion/>}/>
      <Route path='answers' element={<Answers/>}/>
      <Route path='question/:id' element={<QuestionDetail/>}/>
      <Route path='notifications' element={<Notifications/>}/>
    </Routes>
  );
}

export default App;
