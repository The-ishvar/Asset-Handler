import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { FeatureProvider, FeatureGate } from "@/lib/features";
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
import CheckoutPage from "@/pages/checkout";
import MyShopPage from "@/pages/my-shop/index";
import ShopView from "@/pages/my-shop/shop";
import PostsPage from "@/pages/posts/index";
import SnapsPage from "@/pages/snaps/index";
import BookAuto from "@/pages/book/auto";
import BookBus from "@/pages/book/bus";
import BookEvent from "@/pages/book/event";
import BookMedical from "@/pages/book/medical";
import ProviderDashboard from "@/pages/provider/index";

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
import AdminFeatures from "@/pages/admin/features";

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

function FeatureRoute({ component: Component, path, featureKey }) {
  return (
    <Route path={path}>
      <FeatureGate featureKey={featureKey}>
        <Component />
      </FeatureGate>
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
      <AdminRoute path="/admin/features" component={AdminFeatures} />

      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/search" component={Search} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/forgot-password" component={ForgotPassword} />
            <Route path="/profile" component={Profile} />
            <Route path="/profile/:id" component={PublicProfile} />

            <FeatureRoute path="/about" component={About} featureKey="about" />
            <FeatureRoute path="/map" component={VillageMap} featureKey="map" />

            <FeatureRoute path="/schools" component={SchoolsList} featureKey="schools" />
            <FeatureRoute path="/schools/:id" component={SchoolDetail} featureKey="schools" />

            <FeatureRoute path="/medical" component={MedicalList} featureKey="medical" />
            <FeatureRoute path="/medical/:id" component={MedicalDetail} featureKey="medical" />

            <FeatureRoute path="/shops" component={ShopsList} featureKey="shops" />
            <FeatureRoute path="/shops/:id" component={ShopDetail} featureKey="shops" />
            <FeatureRoute path="/my-shop" component={MyShopPage} featureKey="shops" />
            <FeatureRoute path="/shop/:id" component={ShopView} featureKey="shops" />

            <FeatureRoute path="/buses" component={BusList} featureKey="busBooking" />

            <FeatureRoute path="/jobs" component={JobsList} featureKey="jobs" />
            <FeatureRoute path="/jobs/new" component={NewJob} featureKey="jobs" />
            <FeatureRoute path="/jobs/:id" component={JobDetail} featureKey="jobs" />

            <FeatureRoute path="/events" component={EventsList} featureKey="events" />
            <FeatureRoute path="/notices" component={NoticesList} featureKey="notices" />
            <FeatureRoute path="/emergency" component={EmergencyList} featureKey="emergency" />

            <FeatureRoute path="/buy-sell" component={BuySellList} featureKey="marketplace" />
            <FeatureRoute path="/buy-sell/new" component={NewListing} featureKey="marketplace" />
            <FeatureRoute path="/buy-sell/:id" component={ListingDetail} featureKey="marketplace" />
            <FeatureRoute path="/cart" component={CartPage} featureKey="marketplace" />
            <FeatureRoute path="/checkout" component={CheckoutPage} featureKey="marketplace" />

            <FeatureRoute path="/reels" component={Reels} featureKey="reels" />
            <FeatureRoute path="/reels/new" component={NewReel} featureKey="reels" />

            <FeatureRoute path="/notifications" component={NotificationsPage} featureKey="notifications" />
            <FeatureRoute path="/messages" component={MessagesPage} featureKey="messages" />
            <FeatureRoute path="/messages/:userId" component={ConversationPage} featureKey="messages" />

            <FeatureRoute path="/snaps" component={SnapsPage} featureKey="snaps" />
            <FeatureRoute path="/posts" component={PostsPage} featureKey="posts" />

            <FeatureRoute path="/book/auto" component={BookAuto} featureKey="autoBooking" />
            <FeatureRoute path="/book/bus" component={BookBus} featureKey="busBooking" />
            <FeatureRoute path="/book/event" component={BookEvent} featureKey="bookEvent" />
            <FeatureRoute path="/book/medical" component={BookMedical} featureKey="medical" />
            <FeatureRoute path="/provider" component={ProviderDashboard} featureKey="provider" />

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
          <FeatureProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </FeatureProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
