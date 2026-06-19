import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import Layout from "@/components/layout";
import AdminLayout from "@/components/admin-layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import About from "@/pages/about/index";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import Profile from "@/pages/profile/index";
import Search from "@/pages/search/index";
import VillageMap from "@/pages/map/index";

import SchoolsList from "@/pages/schools/index";
import SchoolDetail from "@/pages/schools/detail";
import MedicalList from "@/pages/medical/index";
import MedicalDetail from "@/pages/medical/detail";
import ShopsList from "@/pages/shops/index";
import ShopDetail from "@/pages/shops/detail";
import BusList from "@/pages/buses/index";
import JobsList from "@/pages/jobs/index";
import JobDetail from "@/pages/jobs/detail";
import NewJob from "@/pages/jobs/new";
import EventsList from "@/pages/events/index";
import NoticesList from "@/pages/notices/index";
import EmergencyList from "@/pages/emergency/index";

import BuySellList from "@/pages/buy-sell/index";
import ListingDetail from "@/pages/buy-sell/detail";
import NewListing from "@/pages/buy-sell/new";

import Reels from "@/pages/reels/index";
import NewReel from "@/pages/reels/new";
import NotificationsPage from "@/pages/notifications/index";
import MessagesPage from "@/pages/messages/index";
import ConversationPage from "@/pages/messages/conversation";
import PublicProfile from "@/pages/profile/id";
import CartPage from "@/pages/cart/index";
import MyShopPage from "@/pages/my-shop/index";
import ShopView from "@/pages/my-shop/shop";
import PostsPage from "@/pages/posts/index";
import SnapsPage from "@/pages/snaps/index";

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
    },
  },
});

function AdminRoute({ component: Component, path }) {
  return (
    <Route path={path}>
      <AdminLayout>
        <Component />
      </AdminLayout>
    </Route>
  );
}

function Router() {
  return (
    <Switch>
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

      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/search" component={Search} />
            <Route path="/about" component={About} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/profile" component={Profile} />
            <Route path="/map" component={VillageMap} />

            <Route path="/schools" component={SchoolsList} />
            <Route path="/schools/:id" component={SchoolDetail} />

            <Route path="/medical" component={MedicalList} />
            <Route path="/medical/:id" component={MedicalDetail} />

            <Route path="/shops" component={ShopsList} />
            <Route path="/shops/:id" component={ShopDetail} />

            <Route path="/buses" component={BusList} />
            <Route path="/jobs" component={JobsList} />
            <Route path="/jobs/new" component={NewJob} />
            <Route path="/jobs/:id" component={JobDetail} />
            <Route path="/events" component={EventsList} />
            <Route path="/notices" component={NoticesList} />
            <Route path="/emergency" component={EmergencyList} />

            <Route path="/buy-sell" component={BuySellList} />
            <Route path="/buy-sell/new" component={NewListing} />
            <Route path="/buy-sell/:id" component={ListingDetail} />

            <Route path="/reels" component={Reels} />
            <Route path="/reels/new" component={NewReel} />
            <Route path="/notifications" component={NotificationsPage} />
            <Route path="/messages" component={MessagesPage} />
            <Route path="/messages/:userId" component={ConversationPage} />
            <Route path="/profile/:id" component={PublicProfile} />

            <Route path="/cart" component={CartPage} />
            <Route path="/my-shop" component={MyShopPage} />
            <Route path="/snaps" component={SnapsPage} />
            <Route path="/shop/:id" component={ShopView} />
            <Route path="/posts" component={PostsPage} />

            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
