'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { getPackagesApi, addPackageApi, deletePackageApi } from '@/services/api';
import ConfirmModal from '@/components/ConfirmModal';
import { toast } from 'sonner';
import { hasPermission } from '@/helper/permissions-handler';

export default function AdminPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null; }>({ isOpen: false, id: null, });
  const [form, setForm] = useState({
    category: 'domestic',
    title: '',
    location: '',
    duration: '',
    image: '',
    price: '',
    rating: 4.8,
    reviews: 0,
    featured: false,
    tags: '',
    highlights: '',
    active: true
  });

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await getPackagesApi();
      setPackages(data || []);
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openAddModal = () => {
    setForm({
      title: '',
      location: '',
      duration: '',
      price: '',
      image: '',
      category: 'domestic',
      highlights: '',
      rating: 4.8,
      reviews: 0,
      featured: false,
      tags: '',
      active: true
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPackageApi(form);
      setShowModal(false);
      fetchPackages();
    } catch (err) {
      console.error('Failed to save package:', err);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, id: Number(id) });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deletePackageApi(deleteModal.id);
      fetchPackages();
    } catch (err) {
      console.error('Failed to delete package:', err);
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Packages Management</h2>
          <p className="text-sm text-muted">Manage tour and travel packages offered to customers</p>
        </div>
        {hasPermission('Package', 'create') && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-teal-400 text-black px-4 py-2 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform shadow-md shadow-teal-400/20 cursor-pointer"
          >
            <Plus size={16} /> Add New Package
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted">Loading packages...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-2xl border border-card-border bg-card p-5 relative group flex flex-col justify-between">
              <div className="absolute top-4 right-4 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                {hasPermission('Package', 'delete') && (
                  <button
                    onClick={() => handleDeleteClick(pkg.id)}
                    className="p-2 bg-red-400/10 text-red-400 rounded-lg hover:bg-red-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div>
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-surface mb-4">
                  <img
                    src={pkg.image || (pkg.category === 'domestic' ? 'https://images.unsplash.com/photo-1566228015668-4c45dbc4e2f5?q=80&w=800' : 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800')}
                    alt={pkg.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-teal-400 backdrop-blur-sm">
                    {pkg.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-teal-400 line-clamp-1 mb-1">{pkg.title}</h3>
                <div className="text-xs text-muted flex items-center gap-1.5 mb-3">
                  <MapPin size={12} className="text-teal-500" />
                  <span>{pkg.location}</span>
                </div>

                <div className="space-y-1 text-xs text-muted mb-4">
                  <div><span className="text-muted">Duration:</span> {pkg.duration}</div>
                  <div><span className="text-muted">Rating:</span> ⭐ {pkg.rating || 4.8} ({pkg.reviews || 0} reviews)</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(pkg.highlights || '').split(',').slice(0, 3).map((hl: string, index: number) => (
                      <span key={index} className="px-2 py-0.5 rounded bg-background/50 border border-border text-[9px] text-foreground/80 truncate">
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-card-border flex justify-between items-center mt-2">
                <span className="text-xl font-black text-foreground">₹{Number(pkg.price ?? 0).toLocaleString('en-IN')}</span>
                <span className="text-xs text-muted">/{pkg.duration}</span>
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed border-border rounded-2xl">
              <p className="text-muted">No custom packages added yet. Add your first package!</p>
            </div>
          )}
        </div>
      )}

      {/* Add New Package Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-card border border-card-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-card-border">
              <h3 className="text-xl font-bold">Add Tour Package</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">Package Name (e.g., Mystic Kashmir Valley)</label>
                  <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Source City (e.g., Delhi)</label>
                  <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Destination City (e.g., Srinagar)</label>
                  <input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Package Fare (₹)</label>
                  <input
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value
                      })
                    }
                    placeholder="₹18,999"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Duration (Days)</label>
                  <input
                    required
                    value={form.duration}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        duration: e.target.value
                      })
                    }
                    placeholder="5 Nights / 6 Days"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400">
                    <option value="domestic">Domestic</option>
                    <option value="international">International</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Rating</label>
                  <input required type="number" step="0.1" min="1" max="5" value={form.rating} onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">
                    Package Image (Max 1 MB)
                  </label>
                  {/* <label
                    htmlFor="packageImage"
                    className="flex flex-col items-center justify-center w-full h-10 border-2 border-dashed border-teal-400 rounded-xl cursor-pointer hover:bg-teal-400/5 transition"
                  >
                    <span className="text-xl">📷</span>
                    <span className="mt-1 text-xs font-semibold">
                      Upload Image
                    </span>
                  </label> */}
                  <input
                    key={selectedImage?.name || "empty"}
                    type="file"
                    accept="image/*"
                    className="w-full text-sm"
                    // className="flex flex-col items-center text-center justify-center w-full border-2 border-dashed border-teal-200 rounded-xl cursor-pointer hover:bg-teal-400/5 transition"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 1 * 1024 * 1024) {
                        toast.error("Image size must be less than 1 MB");
                        e.target.value = "";
                        setSelectedImage(null);
                        return;
                      }
                      setSelectedImage(file);
                    }}
                  />
                  {selectedImage && (
                    <div className="mt-3">
                      <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-40 w-full rounded-xl object-cover border" />
                      <div className="flex gap-2 mt-2">
                        <button type="button" onClick={() => setSelectedImage(null)} className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg">Remove Image</button>
                      </div>
                      <p className="text-xs text-green-500 mt-2">Selected: {selectedImage.name}</p>
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">Tags (Comma separated list)</label>
                  <input type="text" name="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Best Seller,Snow Peak" className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">Highlights (Comma separated list)</label>
                  <textarea value={form.highlights} onChange={e => setForm({ ...form, highlights: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400 h-20 resize-none" />
                </div>
                {/* <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">Tags (Comma separated list)</label>
                  <input type="text" name="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Best Seller,Snow Peak" className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div> */}
                <div className="flex justify-between mt-6 text-xs">
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-gray-600 bg-gray-700 text-teal-400 focus:ring-teal-400"
                    />
                    <label htmlFor="featured" className="text-foreground/80 font-medium">
                      Mark as Featured
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-card-border mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-background cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-teal-400 text-black text-sm font-bold shadow-md shadow-teal-400/20 cursor-pointer">Save Package</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Package?"
        message="Are you sure you want to delete this package? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
