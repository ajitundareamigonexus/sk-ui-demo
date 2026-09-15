import { bulkAuthorizeFE } from '@/services/auth';

export interface PermissionItem {
    resource: string;
    operation: string;
    access: boolean;
}

// Full permissions registry mapped to Navbar views and action buttons across the Admin/Agent panel
export let permissions: PermissionItem[] = [
    // ── Navbar & Navigation Pages ──
    { resource: 'NavbarAdmin', operation: 'ViewAdminPage', access: false },
    { resource: 'NavbarAnalytics', operation: 'ViewAnalyticsPage', access: false },
    { resource: 'NavbarHome', operation: 'ViewHomePage', access: false },
    { resource: 'NavbarBookings', operation: 'ViewBookingsPage', access: false },
    { resource: 'NavbarFleet', operation: 'ViewFleetPage', access: false },
    { resource: 'NavbarDrivers', operation: 'ViewDriversPage', access: false },
    { resource: 'NavbarReports', operation: 'ViewReportsPage', access: false },
    { resource: 'NavbarPackages', operation: 'ViewPackagesPage', access: false },
    { resource: 'NavbarReviews', operation: 'ViewReviewsPage', access: false },
    { resource: 'NavbarUsers', operation: 'ViewUsersPage', access: false },

    // ── Booking Actions ──
    { resource: 'BookingForm', operation: 'BookingFormNext', access: false },
    { resource: 'BookingForm', operation: 'BookingFormPayment', access: false },
    { resource: 'BookingForm', operation: 'BookingFormEditDetails', access: false },
    { resource: 'BookingForm', operation: 'VerifyOTPAndProceed', access: false },
    { resource: 'MyBooking', operation: 'CancelRide', access: false },
    { resource: 'ManageBooking', operation: 'update', access: false },
    { resource: 'Booking', operation: 'assignDriver', access: false },
    { resource: 'Booking', operation: 'reschedule', access: false },
    { resource: 'Booking', operation: 'export', access: false },

    // ── Fleet / Vehicle Actions ──
    { resource: 'ManageCars', operation: 'AdminListAddCar', access: false },
    { resource: 'ManageCars', operation: 'AdminListEditCar', access: false },
    { resource: 'ManageCars', operation: 'AdminListDeleteCar', access: false },
    { resource: 'ManageCars', operation: 'AdminFormSaveCar', access: false },


    // ── Driver Actions ──
    { resource: 'ManageDriver', operation: 'AdminListAddDriver', access: false },
    { resource: 'ManageDriver', operation: 'AdminListEditDriver', access: false },
    { resource: 'ManageDriver', operation: 'AdminListDeleteDriver', access: false },
    { resource: 'ManageDriver', operation: 'AdminFormSaveDriver', access: false },

    // ── Package Actions ──
    { resource: 'ManagePackage', operation: 'AdminListAddPackage', access: false },
    { resource: 'ManagePackage', operation: 'AdminListEditPackage', access: false },
    { resource: 'ManagePackage', operation: 'AdminListDeletePackage', access: false },
    { resource: 'ManagePackage', operation: 'AdminFormSavePackage', access: false },

    // ── Review Actions ──
    { resource: 'ManageReview', operation: 'AdminApproveReview', access: false },
    { resource: 'ManageReview', operation: 'AdminRejectReview', access: false },
    { resource: 'ManageReview', operation: 'AdminHideReview', access: false },

    // ── User Management Actions ──
    { resource: 'ManageUser', operation: 'AdminCreateUser', access: false },
    { resource: 'ManageUser', operation: 'AdminUpdateUser', access: false },
    { resource: 'ManageUser', operation: 'AdminDeleteUser', access: false },

    // ── Reports & Analytics Actions ──
    { resource: 'SidebarBookingReport', operation: 'ViewBookingReport', access: false },
    { resource: 'SidebarRevenueReport', operation: 'ViewRevenueReport', access: false },
    { resource: 'SidebarVehicleUtilizationReport', operation: 'ViewVehicleUtilizationReport', access: false },
    { resource: 'SidebarGstReport', operation: 'ViewGstReport', access: false },
    { resource: 'SidebarRoutwiseReport', operation: 'ViewRoutwiseReport', access: false },
    { resource: 'SidebarMaintenancReport', operation: 'ViewMaintenancReport', access: false },
];

export const getTokenData = (key: string = 'token'): { token: string | null } => {
    if (typeof window === 'undefined') return { token: null };
    const token = localStorage.getItem(key) || sessionStorage.getItem(key) || null;
    return { token };
};

const loadPermissionsFromStorage = () => {
    if (typeof window === 'undefined') return;
    const storedPermissions = localStorage.getItem('permissions');
    if (storedPermissions) {
        try {
            const parsed = JSON.parse(storedPermissions);
            if (Array.isArray(parsed)) {
                permissions = parsed;
            }
        } catch (e) {
            console.error('Failed to parse stored permissions:', e);
        }
    }
};

export const initializePermissionsBulk = async (): Promise<PermissionItem[]> => {
    if (typeof window === 'undefined') return permissions;

    const { token } = getTokenData('token');

    if (!token) {
        permissions = permissions.map(p => ({ ...p, access: false }));
        localStorage.setItem('permissions', JSON.stringify(permissions));
        return permissions;
    }

    try {
        const resources = permissions.map(p => p.resource);
        const operations = permissions.map(p => p.operation);

        const accessResults = await bulkAuthorizeFE(token, resources, operations);

        if (Array.isArray(accessResults)) {
            const updatedPermissions = permissions.map((permission, index) => ({
                ...permission,
                access: Boolean(accessResults[index]),
            }));
            permissions = updatedPermissions;
            localStorage.setItem('permissions', JSON.stringify(permissions));

            // Notify components that permissions are updated
            window.dispatchEvent(new CustomEvent('permissionsUpdated', { detail: permissions }));
        }
    } catch (error) {
        console.error('Error initializing permissions:', error);
        loadPermissionsFromStorage();
    }

    return permissions;
};

export const hasPermission = (resource: string, operation: string): boolean => {
    if (typeof window === 'undefined') return false;

    // Safety fallback: Admin role has full access
    const role = localStorage.getItem('role')?.toLowerCase();
    if (role === 'admin') {
        return true;
    }

    loadPermissionsFromStorage();

    const normalizedResource = resource.toLowerCase();
    const normalizedOperation = operation.toLowerCase();

    const permission = permissions.find(
        p =>
            p.resource.toLowerCase() === normalizedResource &&
            p.operation.toLowerCase() === normalizedOperation
    );

    return permission ? Boolean(permission.access) : false;
};