import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8030/api",
});

export const SSAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SSAPI_BASE_URL || '/amigo-ss-api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// SSAPI interceptor — same token store
SSAPI.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

export const sendBookingOtpApi = async (email: string) => {
  const response = await api.post("/auth/send-otp", {
    email,
  });

  return response.data;
};

export const verifyBookingOtpApi = async (
  email: string,
  otp: string,
  fullName?: string,
  mobile?: string,
  preferredLoginType?: string
) => {
  const response = await api.post("/auth/verify-otp", {
    email,
    otp,
    fullName,
    mobile,
    preferredLoginType,
  });

  return response.data;
};
// ─── Bookings ─────────────────────────────────────────────────────────────────

export const createBooking = async (bookingData: any) => {
  const response = await api.post("/bookings", bookingData);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my");
  return response.data;
};

export const cancelBooking = async (id: number | string) => {
  // Send bookingRefId as-is (backend @PathVariable String id)
  const response = await api.put(`/bookings/${id}/cancel`);
  return response.data;
};

export const getDashboard = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const getAllBookings = async () => {
  const response = await api.get("/bookings");
  return response.data;
};

export const updateBookingStatus = async (id: number | string, status: string) => {
  // Send bookingRefId as-is (backend @PathVariable String id)
  const response = await api.put(`/bookings/${id}/status?status=${status}`);
  return response.data;
};

export const assignDriver = async (
  id: number | string,
  driverData: {
    driverId?: number;
    vehicleId?: number;
    allottedVehicleNumber?: string;
    allottedDriverName?: string;
    allottedDriverContact?: string;
  }
) => {
  const response = await api.put(`/bookings/${id}/assign-driver`, driverData);
  return response.data;
};

export const rescheduleBooking = async (
  id: number | string,
  data: { newDate?: string; newFrom?: string; newTo?: string; reason?: string }
) => {
  const response = await api.put(`/bookings/${id}/reschedule`, data);
  return response.data;
};

// ─── Cabs ─────────────────────────────────────────────────────────────────────

export const getCabs = async () => {
  const response = await api.get("/cabs");
  return response.data;
};

export const getAvailableVehicles = async () => {
  const response = await api.get("/cabs/available");
  return response.data;
};

export const addCab = async (cabData: any) => {
  const response = await api.post("/cabs", cabData);
  return response.data;
};

export const updateCab = async (id: number | string, cabData: any) => {
  const response = await api.put(`/cabs/${id}`, cabData);
  return response.data;
};

export const deleteCab = async (id: number | string) => {
  const response = await api.delete(`/cabs/${id}`);
  return response.data;
};

// ─── Packages ─────────────────────────────────────────────────────────────────

export const getPackagesApi = async () => {
  const response = await api.get("/packages");
  return response.data;
};

export const addPackageApi = async (packageData: any) => {
  const response = await api.post("/packages", packageData);
  return response.data;
};
export const deletePackageApi = async (id: number) => {
  const response = await api.delete(`/packages/${id}`);
  return response.data;
};

// export const deletePackageApi = async (id: number | string) => {
//   const numericId = typeof id === "string" ? parseInt(id.replace(/\D/g, ""), 10) : id;
//   const response = await api.delete(`/packages/${numericId}`);
//   return response.data;
// };

export const updatePackageApi = async (id: number | string, packageData: any) => {
  const numericId = typeof id === "string" ? parseInt(id.replace(/\D/g, ""), 10) : id;
  const response = await api.put(`/packages/${numericId}`, packageData);
  return response.data;
};

// ─── Fuel Reports ─────────────────────────────────────────────────────────────
export const getFuelEntries = async () => {
  const response = await api.get("/admin/reports/fuel");
  return response.data;
};

export const addFuelEntry = async (entryData: any) => {
  const response = await api.post("/admin/reports/fuel", entryData);
  return response.data;
};

export const deleteFuelEntry = async (id: number | string) => {
  const response = await api.delete(`/admin/reports/fuel/${id}`);
  return response.data;
};

// ─── Maintenance Reports ──────────────────────────────────────────────────────
export const getMaintenanceEntries = async () => {
  const response = await api.get("/admin/reports/maintenance");
  return response.data;
};

export const addMaintenanceEntry = async (entryData: any) => {
  const response = await api.post("/admin/reports/maintenance", entryData);
  return response.data;
};

export const deleteMaintenanceEntry = async (id: number | string) => {
  const response = await api.delete(`/admin/reports/maintenance/${id}`);
  return response.data;
};

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const getPublicReviews = async (page = 0, size = 10) => {
  const response = await api.get(`/reviews?page=${page}&size=${size}`);
  return response.data;
};

// export const submitReview = async (reviewData: any) => {
//   const response = await api.post("/reviews", reviewData);
//   return response.data;
// };

export const submitReview = async (reviewData: {
  reviewType: string;
  rating: number;
  title: string;
  reviewText: string;
}) => {

  const response = await api.post(
    "/reviews",
    reviewData
  );

  return response.data;
};
export const getMyReviews = async () => {
  const response = await api.get("/reviews/my");
  return response.data;
};

export const getAdminReviews = async (status = "PENDING", page = 0, size = 20) => {
  const response = await api.get(`/admin/reviews?status=${status}&page=${page}&size=${size}`);
  return response.data;
};

export const approveReview = async (id: string) => {
  const response = await api.post(`/admin/reviews/${id}/approve`);
  return response.data;
};

export const rejectReview = async (id: string, reason: string = "") => {
  const response = await api.post(`/admin/reviews/${id}/reject`, { reason });
  return response.data;
};

export const hideReview = async (id: string, reason: string = "") => {
  const response = await api.post(`/admin/reviews/${id}/hide`, { reason });
  return response.data;
};

// ─── Admin: Driver Management (P0-19) ─────────────────────────────────────────────────
// Mirrors the admin agent management pattern

export const getAllDrivers = async () => {
  const response = await api.get('/admin/drivers');
  return response.data;
};

export const getAvailableDrivers = async () => {
  const response = await api.get('/admin/drivers/available');
  return response.data;
};

export const createDriver = async (data: any) => {
  const response = await api.post('/admin/drivers', data);
  return response.data;
};

export const updateDriver = async (id: number, data: any) => {
  const response = await api.put(`/admin/drivers/${id}`, data);
  return response.data;
};

export const toggleDriverStatus = async (id: number, status: 'ACTIVE' | 'INACTIVE') => {
  const response = await api.put(`/admin/drivers/${id}/status`, { status });
  return response.data;
};

export const updateDriverAvailability = async (id: number, availabilityStatus: string) => {
  const response = await api.put(`/admin/drivers/${id}/availability`, { availabilityStatus });
  return response.data;
};

// ─── Admin: Agent Management ───────────────────────────────────────────────────

export const getAgents = async () => {
  const response = await api.get("/admin/agents");
  return response.data;
};

export const createAgent = async (data: any) => {
  const response = await api.post("/admin/agents", data);
  return response.data;
};

export const updateAgent = async (id: string, data: any) => {
  const response = await api.put(`/admin/agents/${id}`, data);
  return response.data;
};

export const toggleAgentStatus = async (id: string, active: boolean) => {
  const response = await api.put(`/admin/agents/${id}/status`, { active });
  return response.data;
};

export const getAgentBookings = async (agentId: string) => {
  const response = await api.get(`/admin/agents/${agentId}/bookings`);
  return response.data;
};

export const getAgentPricingRules = async (agentId: string) => {
  const response = await api.get(`/admin/agents/${agentId}/pricing`);
  return response.data;
};

export const saveAgentPricingRules = async (agentId: string, rules: any) => {
  const response = await api.put(`/admin/agents/${agentId}/pricing`, rules);
  return response.data;
};

// ─── Agent Portal ─────────────────────────────────────────────────────────────

export const getAgentCabs = async () => {
  // Returns cabs with agent-context pricing applied server-side (future)
  const response = await api.get("/agent/cabs");
  return response.data;
};

export const createAgentBooking = async (bookingData: any) => {
  const response = await api.post("/agent/bookings", bookingData);
  return response.data;
};

export const getMyAgentBookings = async () => {
  const response = await api.get("/agent/bookings/my");
  return response.data;
};

export const cancelAgentBooking = async (id: string) => {
  const response = await api.put(`/agent/bookings/${id}/cancel`);
  return response.data;
};
