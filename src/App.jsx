import { BrowserRouter, Routes, Route } from "react-router";

import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";

import Landing from "./pages/Landing";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Gallery from "./pages/Gallery";
import Blocks from "./pages/Blocks";

import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Editor from "./pages/Editor";

const App = () => {
  return <div>
    <Routes>
      <Route index element={<Landing />} />
      <Route element={<PublicRoute><AuthLayout/></PublicRoute>}>
        <Route path="login" element={<Login/>} />
        <Route path="register" element={<Register/>} />
      </Route>
      <Route element={<ProtectedRoute><AppLayout/></ProtectedRoute>}>
        <Route path="home" element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="blocks" element={<Blocks />} />
        <Route path="editor" element={<Editor/>}/>
      </Route>
    </Routes>
  </div>;
};

export default App;