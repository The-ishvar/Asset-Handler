import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE = "/api";

let _token = null;

export function setAuthToken(token) {
  _token = token;
}

export function getAuthToken() {
  return _token;
}

function authHeaders() {
  return _token ? { Authorization: `Bearer ${_token}` } : {};
}

const api = axios.create({ baseURL: BASE });
api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      "An error occurred";
    return Promise.reject(new Error(msg));
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────
export function useLogin() {
  return useMutation({
    mutationFn: (data) => api.post("/auth/login", data).then((r) => r.data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data) => api.post("/auth/register", data).then((r) => r.data),
  });
}

export function useGetMe(options = {}) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me").then((r) => r.data),
    ...options,
  });
}

export function useHealthCheck(options = {}) {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => api.get("/health").then((r) => r.data),
    staleTime: Infinity,
    ...options,
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data) => api.post("/auth/forgot-password", data).then((r) => r.data),
  });
}

// ─── Users ───────────────────────────────────────────────────────────────────
export function useListUsers(options = {}) {
  return useQuery({
    queryKey: ["listUsers"],
    queryFn: () => api.get("/users").then((r) => r.data),
    ...options,
  });
}

export function useGetUser(id, options = {}) {
  return useQuery({
    queryKey: ["getUser", id],
    queryFn: () => api.get(`/users/${id}`).then((r) => r.data),
    enabled: !!id,
    ...options,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/users/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["listUsers"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/users/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listUsers"] }),
  });
}

export function usePatchMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch("/users/me/update-profile", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

// ─── Social ──────────────────────────────────────────────────────────────────
export function useGetUserProfile(id, options = {}) {
  return useQuery({
    queryKey: ["getUserProfile", id],
    queryFn: () => api.get(`/users/${id}/profile`).then((r) => r.data),
    enabled: !!id,
    ...options,
  });
}

export function useToggleFollow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.post(`/users/${id}/follow`).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["getUserProfile", id] });
    },
  });
}

// ─── Schools ─────────────────────────────────────────────────────────────────
export function useListSchools(options = {}) {
  return useQuery({
    queryKey: ["listSchools"],
    queryFn: () => api.get("/schools").then((r) => r.data),
    ...options,
  });
}

export function useGetSchool(id, options = {}) {
  return useQuery({
    queryKey: ["getSchool", id],
    queryFn: () => api.get(`/schools/${id}`).then((r) => r.data),
    enabled: !!id,
    ...options,
  });
}

export function useCreateSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/schools", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listSchools"] }),
  });
}

export function useDeleteSchool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/schools/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listSchools"] }),
  });
}

// ─── Medical ─────────────────────────────────────────────────────────────────
export function useListMedical(options = {}) {
  return useQuery({
    queryKey: ["listMedical"],
    queryFn: () => api.get("/medical").then((r) => r.data),
    ...options,
  });
}

export function useGetMedical(id, options = {}) {
  return useQuery({
    queryKey: ["getMedical", id],
    queryFn: () => api.get(`/medical/${id}`).then((r) => r.data),
    enabled: !!id,
    ...options,
  });
}

export function useCreateMedical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/medical", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listMedical"] }),
  });
}

export function useDeleteMedical() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/medical/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listMedical"] }),
  });
}

// ─── Shops ───────────────────────────────────────────────────────────────────
export function useListShops(options = {}) {
  return useQuery({
    queryKey: ["listShops"],
    queryFn: () => api.get("/shops").then((r) => r.data),
    ...options,
  });
}

export function useGetShop(id, options = {}) {
  return useQuery({
    queryKey: ["getShop", id],
    queryFn: () => api.get(`/shops/${id}`).then((r) => r.data),
    enabled: !!id,
    ...options,
  });
}

export function useCreateShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/shops", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listShops"] }),
  });
}

export function useDeleteShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/shops/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listShops"] }),
  });
}

// ─── Listings ────────────────────────────────────────────────────────────────
export function useListListings(params = {}, options = {}) {
  return useQuery({
    queryKey: ["listListings", params],
    queryFn: () => api.get("/listings", { params }).then((r) => r.data),
    ...options,
  });
}

export function useGetListing(id, options = {}) {
  return useQuery({
    queryKey: ["getListing", id],
    queryFn: () => api.get(`/listings/${id}`).then((r) => r.data),
    enabled: !!id,
    ...options,
  });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/listings", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listListings"] }),
  });
}

export function useApproveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/listings/${id}/approve`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listListings"] }),
  });
}

export function useDeleteListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/listings/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listListings"] }),
  });
}

// ─── Buses ───────────────────────────────────────────────────────────────────
export function useListBuses(options = {}) {
  return useQuery({
    queryKey: ["listBuses"],
    queryFn: () => api.get("/buses").then((r) => r.data),
    ...options,
  });
}

export function useCreateBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/buses", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listBuses"] }),
  });
}

export function useDeleteBus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/buses/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listBuses"] }),
  });
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
export function useGetJob(id, options = {}) {
  return useQuery({
    queryKey: ["getJob", id],
    queryFn: () => api.get(`/jobs/${id}`).then((r) => r.data),
    enabled: !!id,
    ...options,
  });
}

export function useListJobs(options = {}) {
  return useQuery({
    queryKey: ["listJobs"],
    queryFn: () => api.get("/jobs").then((r) => r.data),
    ...options,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/jobs", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listJobs"] }),
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/jobs/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listJobs"] }),
  });
}

// ─── Events ──────────────────────────────────────────────────────────────────
export function useListEvents(options = {}) {
  return useQuery({
    queryKey: ["listEvents"],
    queryFn: () => api.get("/events").then((r) => r.data),
    ...options,
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/events", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listEvents"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/events/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listEvents"] }),
  });
}

// ─── Notices ─────────────────────────────────────────────────────────────────
export function useListNotices(options = {}) {
  return useQuery({
    queryKey: ["listNotices"],
    queryFn: () => api.get("/notices").then((r) => r.data),
    ...options,
  });
}

export function useCreateNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/notices", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listNotices"] }),
  });
}

export function useDeleteNotice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/notices/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listNotices"] }),
  });
}

// ─── Emergency ───────────────────────────────────────────────────────────────
export function useListEmergency(options = {}) {
  return useQuery({
    queryKey: ["listEmergency"],
    queryFn: () => api.get("/emergency").then((r) => r.data),
    ...options,
  });
}

export function useCreateEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/emergency", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listEmergency"] }),
  });
}

export function useDeleteEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.delete(`/emergency/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listEmergency"] }),
  });
}

// ─── Reels ───────────────────────────────────────────────────────────────────
export function useListReels(params = {}, options = {}) {
  return useQuery({
    queryKey: ["listReels", params],
    queryFn: () => api.get("/reels", { params }).then((r) => r.data),
    ...options,
  });
}

export function useCreateReel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/reels", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listReels"] }),
  });
}

export function useToggleReelLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.post(`/reels/${id}/like`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listReels"] }),
  });
}

export function useRecordReelView() {
  return useMutation({
    mutationFn: ({ id }) => api.post(`/reels/${id}/view`).then((r) => r.data),
  });
}

export function useListReelComments(reelId, options = {}) {
  return useQuery({
    queryKey: ["listReelComments", reelId],
    queryFn: () => api.get(`/reels/${reelId}/comments`).then((r) => r.data),
    enabled: !!reelId,
    ...options,
  });
}

export function useAddReelComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/reels/${id}/comments`, data).then((r) => r.data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: ["listReelComments", id] }),
  });
}

// ─── Notifications ───────────────────────────────────────────────────────────
export function useListNotifications(options = {}) {
  return useQuery({
    queryKey: ["listNotifications"],
    queryFn: () => api.get("/notifications").then((r) => r.data),
    ...options,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listNotifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch("/notifications/read-all").then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listNotifications"] }),
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────
export function useListConversations(options = {}) {
  return useQuery({
    queryKey: ["listConversations"],
    queryFn: () => api.get("/messages/conversations").then((r) => r.data),
    ...options,
  });
}

export function useGetConversation(userId, options = {}) {
  return useQuery({
    queryKey: ["getConversation", userId],
    queryFn: () => api.get(`/messages/${userId}`).then((r) => r.data),
    enabled: !!userId,
    ...options,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/messages", data).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["getConversation", vars.receiverId] });
      qc.invalidateQueries({ queryKey: ["listConversations"] });
    },
  });
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export function useGetCart(options = {}) {
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get("/cart").then((r) => r.data),
    ...options,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId) => api.post("/cart", { listingId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

export function useRemoveFromCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (listingId) => api.delete(`/cart/${listingId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });
}

// ─── User Shops ───────────────────────────────────────────────────────────────
export function useGetMyShop(options = {}) {
  return useQuery({
    queryKey: ["myShop"],
    queryFn: () => api.get("/user-shops/my").then((r) => r.data),
    ...options,
  });
}

export function useGetUserShop(shopId, options = {}) {
  return useQuery({
    queryKey: ["userShop", shopId],
    queryFn: () => api.get(`/user-shops/${shopId}`).then((r) => r.data),
    enabled: !!shopId,
    ...options,
  });
}

export function useCreateMyShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/user-shops", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myShop"] }),
  });
}

export function useUpdateMyShop() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch("/user-shops/my", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myShop"] }),
  });
}

export function useAddShopItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/user-shops/my/items", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myShop"] }),
  });
}

export function useDeleteShopItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => api.delete(`/user-shops/my/items/${itemId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myShop"] }),
  });
}

// ─── Job Applications ────────────────────────────────────────────────────────
export function useApplyToJob() {
  return useMutation({
    mutationFn: ({ id, data }) => api.post(`/jobs/${id}/apply`, data).then((r) => r.data),
  });
}

export function useCheckApplied(jobId, options = {}) {
  return useQuery({
    queryKey: ["jobApplied", jobId],
    queryFn: () => api.get(`/jobs/${jobId}/applied`).then((r) => r.data),
    enabled: !!jobId,
    ...options,
  });
}

export function useGetJobApplications(jobId, options = {}) {
  return useQuery({
    queryKey: ["jobApplications", jobId],
    queryFn: () => api.get(`/jobs/${jobId}/applications`).then((r) => r.data),
    enabled: !!jobId,
    ...options,
  });
}

// ─── Posts ───────────────────────────────────────────────────────────────────
export function useListPosts(options = {}) {
  return useQuery({
    queryKey: ["listPosts"],
    queryFn: () => api.get("/posts").then((r) => r.data),
    ...options,
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/posts", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listPosts"] }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listPosts"] }),
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/posts/${id}/like`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listPosts"] }),
  });
}

export function useGetPostComments(postId, options = {}) {
  return useQuery({
    queryKey: ["postComments", postId],
    queryFn: () => api.get(`/posts/${postId}/comments`).then((r) => r.data),
    enabled: !!postId,
    ...options,
  });
}

export function useAddPostComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, content }) => api.post(`/posts/${id}/comments`, { content }).then((r) => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["postComments", vars.id] });
      qc.invalidateQueries({ queryKey: ["listPosts"] });
    },
  });
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export function useGetDashboardStats(options = {}) {
  return useQuery({
    queryKey: ["getDashboardStats"],
    queryFn: () => api.get("/stats").then((r) => r.data),
    ...options,
  });
}

export function useGetRecentActivity(options = {}) {
  return useQuery({
    queryKey: ["getRecentActivity"],
    queryFn: () => api.get("/stats/activity").then((r) => r.data),
    ...options,
  });
}

// ─── User Search ──────────────────────────────────────────────────────────────
export function useSearchUsers(query, options = {}) {
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: () => api.get(`/users/search?q=${encodeURIComponent(query)}`).then((r) => r.data),
    enabled: !!query && query.length >= 2,
    ...options,
  });
}

// ─── Snaps ────────────────────────────────────────────────────────────────────
export function useGetSnapInbox(options = {}) {
  return useQuery({
    queryKey: ["snapInbox"],
    queryFn: () => api.get("/snaps/inbox").then((r) => r.data),
    refetchInterval: 15000,
    ...options,
  });
}

export function useGetSnapSent(options = {}) {
  return useQuery({
    queryKey: ["snapSent"],
    queryFn: () => api.get("/snaps/sent").then((r) => r.data),
    ...options,
  });
}

export function useGetMyFollowing(options = {}) {
  return useQuery({
    queryKey: ["myFollowing"],
    queryFn: () => api.get("/users/me/following").then((r) => r.data),
    ...options,
  });
}

export function useSendSnap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/snaps", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snapInbox"] });
      qc.invalidateQueries({ queryKey: ["snapSent"] });
    },
  });
}

export function useSendSnapBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/snaps/bulk", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snapInbox"] });
      qc.invalidateQueries({ queryKey: ["snapSent"] });
    },
  });
}

export function useViewSnap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/snaps/${id}/view`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snapInbox"] });
      qc.invalidateQueries({ queryKey: ["snapSent"] });
    },
  });
}

export function useDeleteSnap() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/snaps/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["snapSent"] });
    },
  });
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export function useMyBookings(type, options = {}) {
  return useQuery({
    queryKey: ["myBookings", type],
    queryFn: () => api.get("/bookings/mine", { params: type ? { type } : {} }).then((r) => r.data),
    ...options,
  });
}

export function useGetBooking(id, options = {}) {
  return useQuery({
    queryKey: ["getBooking", id],
    queryFn: () => api.get(`/bookings/${id}`).then((r) => r.data),
    enabled: !!id,
    ...options,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/bookings", data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBookings"] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/bookings/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["myBookings"] }),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }) =>
      api.patch(`/bookings/${id}/status`, { status, note }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBookings"] });
      qc.invalidateQueries({ queryKey: ["providerBookings"] });
    },
  });
}

export function useProviderDashboard(options = {}) {
  return useQuery({
    queryKey: ["providerBookings"],
    queryFn: () => api.get("/bookings/provider").then((r) => r.data),
    ...options,
  });
}

export function useProviderEarnings(options = {}) {
  return useQuery({
    queryKey: ["providerEarnings"],
    queryFn: () => api.get("/bookings/provider/earnings").then((r) => r.data),
    ...options,
  });
}

export function useListProviders(type, options = {}) {
  return useQuery({
    queryKey: ["listProviders", type],
    queryFn: () => api.get("/bookings/providers/list", { params: type ? { type } : {} }).then((r) => r.data),
    ...options,
  });
}

// ─── Stories ──────────────────────────────────────────────────────────────────
export function useListStories(options = {}) {
  return useQuery({
    queryKey: ["listStories"],
    queryFn: () => api.get("/stories").then((r) => r.data),
    refetchInterval: 60000,
    ...options,
  });
}

export function useCreateStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/stories", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listStories"] }),
  });
}

export function useDeleteStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/stories/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listStories"] }),
  });
}

export function useRecordStoryView() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.post(`/stories/${id}/view`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listStories"] }),
  });
}
