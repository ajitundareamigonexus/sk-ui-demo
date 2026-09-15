import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Edit2,
  X,
  Save,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAllUsers, getRoles, registerUser, Role } from '@/services/auth';
import { hasPermission } from '@/helper/permissions-handler';


export interface UserRoleItem {
  name?: string;
  accessList?: string[];
  appName?: string | null;
  description?: string | null;
}

export interface User {
  id?: string | number;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  roles?: (UserRoleItem | string)[];
  status?: 'active' | 'inactive';
  createdAt?: string;
}

export const getUserRole = (user: User): string => {
  if (user.role) return user.role;
  if (Array.isArray(user.roles) && user.roles.length > 0) {
    const names = user.roles
      .map(r => (typeof r === 'string' ? r : r?.name))
      .filter(Boolean);
    return names.join(', ');
  }
  return '';
};

export const isCustomerUser = (user: User): boolean => {
  if (user.role && user.role.toLowerCase() === 'customer') return true;
  if (Array.isArray(user.roles)) {
    return user.roles.some(r => {
      const name = typeof r === 'string' ? r : r?.name;
      return name?.toLowerCase() === 'customer';
    });
  }
  return false;
};

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}

function FormField({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder = '',
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-10 px-3 text-sm bg-surface border rounded-xl outline-none transition ${error
            ? 'border-red-500'
            : 'border-border focus:border-teal-400'
          }`}
      />
      {error && (
        <p className="text-[10px] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function UserModal({
  user,
  roles,
  onClose,
  onSave,
}: {
  user: Partial<User> | null;
  roles: Role[];
  onClose: () => void;
  onSave: (user: User) => void;
}) {
  const isNew = !user?.id;
  const initialRole = user ? getUserRole(user as User) : '';

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    role: initialRole,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));

    setErrors(prev => ({
      ...prev,
      [key]: '',
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (isNew && !form.password.trim()) {
      newErrors.password = 'Password is required';
    }
    if (isNew && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!form.role) {
      newErrors.role = 'Please select a role';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSave = async () => {
    if (!validate()) return;

    try {
      // CREATE USER
      if (isNew) {
        const response = await registerUser({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          preferredLoginType: 'EMAIL',
        });
        const savedUser: User = {
          id: response.id || form.email.trim(),
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          roles: [{ name: form.role }],
          createdAt: new Date().toISOString(),
        };
        onSave(savedUser);
        toast.success('User created successfully', {
          description: form.email,
        });
        return;
      }
      // EDIT USER
      const updatedUser: User = {
        ...user,
        id: user?.id,
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        roles: [{ name: form.role }],
        createdAt: user?.createdAt,
      };
      onSave(updatedUser);

      toast.success('User updated successfully', {
        description: form.email,
      });
    } catch (error: any) {
      console.error('User save error:', error);
      toast.error(
        isNew
          ? 'Failed to create user'
          : 'Failed to update user',
        {
          description:
            error?.response?.data?.message ||
            error?.message ||
            'Something went wrong',
        }
      );
    }
  };

  // Exclude 'Customer' role from selection
  const selectableRoles = useMemo(() => {
    return (roles || []).filter(
      role => role?.name && role.name.toLowerCase() !== 'customer'
    );
  }, [roles]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-card border border-card-border rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-5 border-b border-card-border bg-teal-500/5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-foreground flex items-center gap-2">
              {isNew ? (
                <Plus size={16} className="text-teal-400" />
              ) : (
                <Edit2 size={16} className="text-teal-400" />
              )}
              {isNew ? 'Create User' : 'Edit User'}
            </h3>
            <p className="text-xs text-muted mt-1">
              {isNew
                ? 'Create a new system user'
                : 'Update user information'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border bg-background flex items-center justify-center text-muted hover:text-foreground transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-160px)]">
          <FormField
            label="Name *"
            value={form.name}
            onChange={val => set('name', val)}
            error={errors.name}
            placeholder="Enter user name"
          />
          <FormField
            label="Email *"
            value={form.email}
            onChange={val => set('email', val)}
            error={errors.email}
            type="email"
            placeholder="user@example.com"
          />
          <FormField
            label={isNew ? 'Password *' : 'Password'}
            value={form.password}
            onChange={val => set('password', val)}
            error={errors.password}
            type="password"
            placeholder={
              isNew
                ? 'Enter password'
                : 'Leave blank to keep current password'
            }
          />
          <FormField
            label={isNew ? 'Confirm Password *' : 'Confirm Password'}
            value={form.confirmPassword}
            onChange={val => set('confirmPassword', val)}
            error={errors.confirmPassword}
            type="password"
            placeholder="Confirm password"
          />
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={13} />
              Role *
            </label>
            <select
              value={form.role}
              onChange={e => set('role', e.target.value)}
              className="w-full h-10 px-3 text-sm bg-surface border rounded-xl outline-none focus:border-teal-400 transition"
            >
              <option value="">
                Select Role
              </option>
              {selectableRoles.map((role, idx) => (
                <option
                  key={role.id || role.name || idx}
                  value={role.name}
                >
                  {role.name}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-[10px] text-red-400">
                {errors.role}
              </p>
            )}
          </div>
        </div>
        <div className="p-5 border-t border-card-border bg-surface flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 border border-border text-muted font-bold text-sm rounded-xl hover:text-foreground transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-11 bg-teal-500 text-black font-extrabold text-sm rounded-xl hover:opacity-90 transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <Save size={14} />
            {isNew ? 'Create User' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');

  const [editingUser, setEditingUser] =
    useState<Partial<User> | null | 'new'>(null);

  // Exclude customer users from the main page list
  const nonCustomerUsers = useMemo(() => {
    return users.filter(user => !isCustomerUser(user));
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return nonCustomerUsers;
    return nonCustomerUsers.filter(user =>
      [
        user.name,
        user.email,
        getUserRole(user),
      ]
        .filter(Boolean)
        .some(value =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [nonCustomerUsers, search]);

  const loadRoles = async () => {
    try {
      const response = await getRoles();
      const rolesList = Array.isArray(response)
        ? response
        : (response as any)?.value || [];
      setRoles(rolesList);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      const usersList = Array.isArray(response)
        ? response
        : (response as any)?.value || [];
      setUsers(usersList);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  const handleSaveUser = (user: User) => {
    setUsers(prev => {
      if (user.id) {
        return prev.map(existing =>
          existing.id === user.id
            ? { ...existing, ...user }
            : existing
        );
      }
      const newUser: User = {
        ...user,
        id: user.id || user.email || Date.now(),
      };
      return [...prev, newUser];
    });
    setEditingUser(null);
    loadUsers();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Manage Users
          </h2>

          <p className="text-sm text-muted mt-1">
            Create and manage system users
          </p>
        </div>
        {hasPermission('User', 'create') && (
          <button
            onClick={() => setEditingUser('new')}
            className="flex items-center gap-2 h-11 px-5 bg-teal-500 text-black font-bold text-sm rounded-xl hover:opacity-90 transition cursor-pointer shadow-md"
          >
            <Plus size={15} />
            Add User
          </button>
        )}
      </div>
      <div className="relative mb-4">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-11 rounded-xl border border-border bg-background pl-9 pr-4 text-sm outline-none focus:border-teal-400 transition"
        />
      </div>
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 border border-card-border bg-card rounded-2xl text-muted">

          <Users
            size={40}
            className="mx-auto mb-4 opacity-20"
          />
          <p className="font-semibold text-foreground">
            {nonCustomerUsers.length === 0
              ? 'No users yet'
              : 'No users match your search'}
          </p>
          <p className="text-sm mt-1">
            {nonCustomerUsers.length === 0
              ? 'Click "Add User" to create the first user.'
              : 'Try clearing the search.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-card-border bg-card shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-card-border bg-teal-500/5 text-[10px] font-bold uppercase tracking-wider text-muted">
                <th className="p-4">
                  User
                </th>
                <th className="p-4">
                  Email
                </th>
                <th className="p-4">
                  Role
                </th>
                <th className="p-4 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-sm">
              {filteredUsers.map(user => (
                <tr
                  key={user.id}
                  className="hover:bg-teal-500/[0.02] transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                        <Users
                          size={15}
                          className="text-teal-400"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {user.name || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <Mail
                        size={12}
                        className="text-teal-400"
                      />
                      {user.email || '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/10">
                      <ShieldCheck size={10} />
                      {getUserRole(user) || '-'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {hasPermission('User', 'update') && (
                      <button
                        onClick={() => setEditingUser(user)}
                        title="Edit User"
                        className="inline-flex items-center gap-1 h-8 px-3 rounded-lg text-[11px] font-bold border border-border text-muted hover:text-foreground hover:border-teal-400 transition cursor-pointer"
                      >
                        <Edit2 size={11} />
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AnimatePresence>
        {editingUser !== null && (
          <UserModal
            user={
              editingUser === 'new'
                ? null
                : editingUser
            }
            roles={roles}
            onClose={() => setEditingUser(null)}
            onSave={handleSaveUser}
          />
        )}
      </AnimatePresence>
    </>
  );
}
