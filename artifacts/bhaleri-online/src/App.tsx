import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import Layout from "@/components/layout";
import AdminLayout from "@/components/admin-layout";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/home";
import About from "@/pages/about/index";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile/index";
import Search from "@/pages/search/index";

// Directory Pages
import SchoolsList from "@/pages/schools/index";
import SchoolDetail from "@/pages/schools/detail";
import MedicalList from "@/pages/medical/index";
import MedicalDetail from "@/pages/medical/detail";
import ShopsList from "@/pages/shops/index";
import ShopDetail from "@/pages/shops/detail";
import BusList from "@/pages/buses/index";
import JobsList from "@/pages/jobs/index";
import EventsList from "@/pages/events/index";
import NoticesList from "@/pages/notices/index";
import EmergencyList from "@/pages/emergency/index";

// Buy & Sell
import BuySellList from "@/pages/buy-sell/index";
import ListingDetail from "@/pages/buy-sell/detail";
import NewListing from "@/pages/buy-sell/new";

// Admin Pages
import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users";
import AdminListings from "@/pages/admin/listings";
import AdminSchools from "@/pages/admin/schools";
import AdminMedical from "@/pages/admin/medical";
import AdminShops from "@/pages/admin/shops";
import AdminBuses from "@/pages/admin/buses";
import AdminJobs from "@/pages/admin/jobs";
import AdminEvents from "@/pages/admin/events";
import AdminNotices from "@/pages/admin/notices";
import AdminEmergency from "@/pages/admin/emergency";

const queryClient = new QueryClient();

// Helper to wrap admin routes in AdminLayout
const AdminRoute = ({ component: Component, path }: { component: any, path: string }) => (
  <Route path={path}>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </Route>
);

function Router() {
  return (
    <Switch>
      {/* Admin Routes */}
      <AdminRoute path="/admin" component={AdminDashboard} />
      <AdminRoute path="/admin/users" component={AdminUsers} />
      <AdminRoute path="/admin/listings" component={AdminListings} />
      <AdminRoute path="/admin/schools" component={AdminSchools} />
      <AdminRoute path="/admin/medical" component={AdminMedical} />
      <AdminRoute path="/admin/shops" component={AdminShops} />
      <AdminRoute path="/admin/buses" component={AdminBuses} />
      <AdminRoute path="/admin/jobs" component={AdminJobs} />
      <AdminRoute path="/admin/events" component={AdminEvents} />
      <AdminRoute path="/admin/notices" component={AdminNotices} />
      <AdminRoute path="/admin/emergency" component={AdminEmergency} />

      {/* Public Routes with Standard Layout */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/search" component={Search} />
            <Route path="/about" component={About} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/profile" component={Profile} />
            
            <Route path="/schools" component={SchoolsList} />
            <Route path="/schools/:id" component={SchoolDetail} />
            
            <Route path="/medical" component={MedicalList} />
            <Route path="/medical/:id" component={MedicalDetail} />
            
            <Route path="/shops" component={ShopsList} />
            <Route path="/shops/:id" component={ShopDetail} />
            
            <Route path="/buses" component={BusList} />
            <Route path="/jobs" component={JobsList} />
            <Route path="/events" component={EventsList} />
            <Route path="/notices" component={NoticesList} />
            <Route path="/emergency" component={EmergencyList} />
            
            <Route path="/buy-sell" component={BuySellList} />
            <Route path="/buy-sell/new" component={NewListing} />
            <Route path="/buy-sell/:id" component={ListingDetail} />
            
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
