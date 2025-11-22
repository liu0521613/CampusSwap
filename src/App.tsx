import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import HomeSimple from "@/pages/HomeSimple";
import HomeMinimal from "@/pages/HomeMinimal";
import BasicTest from "@/pages/BasicTest";
import Detail from "@/pages/Detail";
import Publish from "@/pages/Publish";
import Category from "@/pages/Category";
import Auth from "@/pages/Auth";
import MyItems from "@/pages/MyItems";
import { AuthProvider, AuthContext } from '@/contexts/authContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/simple" element={<HomeSimple />} />
      <Route path="/minimal" element={<HomeMinimal />} />
      <Route path="/test" element={<BasicTest />} />
      <Route path="/detail/:id" element={<Detail />} />
      <Route path="/publish" element={<Publish />} />
      <Route path="/category/:id" element={<Category />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/my-items" element={<MyItems />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}
