import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PlatformProvider } from "@/contexts/PlatformContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Businesses from "./pages/Businesses";
import BusinessDetail from "./pages/BusinessDetail";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import BusinessForm from "./pages/BusinessForm";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Disclaimer from "./pages/Disclaimer";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBusinesses from "./pages/admin/AdminBusinesses";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAmenities from "./pages/admin/AdminAmenities";
import AdminClaims from "./pages/admin/AdminClaims";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminGoogleImport from "./pages/admin/AdminGoogleImport";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PlatformProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/businesses/" element={<Businesses />} />
              <Route path="/businesses/:categorySlug/" element={<Businesses />} />
              <Route path="/business/:slug/" element={<BusinessDetail />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/add" element={<BusinessForm />} />
              <Route path="/dashboard/edit/:id" element={<BusinessForm />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="businesses" element={<AdminBusinesses />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="amenities" element={<AdminAmenities />} />
                <Route path="claims" element={<AdminClaims />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="google-import" element={<AdminGoogleImport />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </PlatformProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
