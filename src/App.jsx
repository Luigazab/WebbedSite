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
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import AdminLayout from "./layouts/AdminLayout";
import Overview from "./pages/admin/Overview";
import Users from "./pages/admin/Users";
import ProjectsManage from "./pages/admin/ProjectsManage";
import TutorialsManage from "./pages/admin/TutorialsManage";
import BadgesManage from "./pages/admin/BadgesManage";
import BlocksManage from "./pages/admin/BlocksManage";
import Playground from "./pages/Playground";
import Tutorial from "./pages/Tutorial";
import UserDetail from "./pages/admin/UserDetail";
import GuestLayout from "./layouts/GuestLayout";

const App = () => {
  return <div>
    <Routes>
      {/* <Route index element={<Landing />} /> */}
      <Route element={<PublicRoute><AuthLayout/></PublicRoute>}>
        <Route path="login" element={<Login/>} />
        <Route path="register" element={<Register/>} />
      </Route>
      <Route path="guest/" element={<GuestLayout/>}>
        <Route path="editor" element={<Editor/>} />
        <Route path="blocks" element={<Blocks/>} />
        <Route path="gallery" element={<Gallery/>} />
      </Route>
      <Route element={<ProtectedRoute><AppLayout/></ProtectedRoute>}>
        <Route index element={<Home />} />
        <Route path="projects" element={<Projects />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="blocks" element={<Blocks />} />
        <Route path="editor/:id?" element={<Editor/>}/>
        <Route path="learn/:id?" element={<Tutorial/>}/>
        <Route path="profile" element={<Profile/>}/>
        <Route path="profile/:userId" element={<Profile/>}/>
      </Route>
      <Route element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route path="overview" element={<Overview/>} />
        <Route path="users" element={<Users/>} />
        <Route path="users/:userId" element={<UserDetail/>} />
        <Route path="projects-manage" element={<ProjectsManage/>} />
        <Route path="tutorials-manage" element={<TutorialsManage/>} />
        <Route path="badges-manage" element={<BadgesManage/>} />
        <Route path="blocks-manage" element={<BlocksManage/>} />
      </Route>
      <Route path="*" element={<NotFound/>}/>
      <Route path="playground" element={<Playground/>}/>
    </Routes>
  </div>;
};

export default App;