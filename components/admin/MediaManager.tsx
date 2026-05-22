'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Trash2, 
  Eye, 
  EyeOff, 
  GripVertical,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  X,
  Search,
  Filter,
  Edit,
  Save
} from 'lucide-react';
import { type MediaAsset } from '@/types/media';

const SECTIONS = [
  { value: 'landing', label: 'Landing Page', description: 'Hero and main page images' },
  { value: 'wellness', label: 'Wellness Page', description: 'Wellness platform images' },
  { value: 'about', label: 'About Us', description: 'About page content' },
  { value: 'services', label: 'Services', description: 'Services page images' },
  { value: 'gallery', label: 'Gallery', description: 'Photo gallery' },
  { value: 'blank', label: 'Blank Section', description: 'General images without specific placement' },
  { value: 'success-stories', label: 'Success Stories', description: 'Testimonial photos' },
  { value: 'news', label: 'News & Blog', description: 'News article images' }
];

export default function MediaManager() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
  const [editForm, setEditForm] = useState({ alt: '', caption: '' });
  const [dragging, setDragging] = useState(false);

  // Fetch media assets
  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const url = selectedSection !== 'all' 
        ? `/api/admin/media?section=${selectedSection}` 
        : '/api/admin/media';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAssets(data.assets);
      } else {
        setError(data.error || 'Failed to load media');
      }
    } catch {
      setError('Failed to load media assets');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSection]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Handle file upload
  const handleFileUpload = async (files: FileList | null, section: string) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('section', section);

        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Upload failed');
        }
      }

      setSuccess(`Successfully uploaded ${files.length} image(s)`);
      fetchAssets();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setAssets(assets.filter(a => a.id !== id));
        setSuccess('Image deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Delete failed');
      }
    } catch {
      setError('Failed to delete image');
    }
  };

  // Open edit modal
  const openEditModal = (asset: MediaAsset) => {
    setEditingAsset(asset);
    setEditForm({
      alt: asset.alt || '',
      caption: asset.caption || ''
    });
  };

  // Save image description edits
  const saveEdit = async () => {
    if (!editingAsset) return;

    try {
      const response = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAsset.id,
          updates: {
            alt: editForm.alt.trim() || undefined,
            caption: editForm.caption.trim() || undefined
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAssets(assets.map(a => a.id === editingAsset.id ? data.asset : a));
        setSuccess('Image description updated successfully');
        setEditingAsset(null);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Update failed');
      }
    } catch {
      setError('Failed to update image description');
    }
  };

  // Toggle visibility
  const toggleVisibility = async (asset: MediaAsset) => {
    try {
      const response = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: asset.id,
          updates: { isActive: !asset.isActive }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAssets(assets.map(a => a.id === asset.id ? data.asset : a));
      } else {
        setError(data.error || 'Update failed');
      }
    } catch {
      setError('Failed to update image');
    }
  };

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.caption?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSection = selectedSection === 'all' || asset.section === selectedSection;
    return matchesSearch && matchesSection;
  });

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Media Manager</h2>
        <p className="text-gray-600">Upload and manage images for the CAT Kenya website</p>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Images</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SECTIONS.map((section) => (
            <div
              key={section.value}
              className={`relative p-6 rounded-xl border-2 border-dashed transition-all duration-300 ${
                dragging 
                  ? 'border-violet-400 bg-violet-50' 
                  : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFileUpload(e.dataTransfer.files, section.value);
              }}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileUpload(e.target.files, section.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-white" />
                  )}
                </div>
                <p className="font-semibold text-gray-900">{section.label}</p>
                <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                <p className="text-xs text-gray-400 mt-2">Click or drag images here</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Sections</option>
            {SECTIONS.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Media Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <p className="text-gray-500 mt-4">Loading media...</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No images found</p>
          <p className="text-gray-400 text-sm mt-1">Upload images using the sections above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <motion.div
              key={asset.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`group relative bg-white rounded-xl overflow-hidden border-2 transition-all ${
                asset.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}
            >
              {/* Image */}
              <div 
                className="aspect-square bg-gray-100 cursor-pointer"
                onClick={() => setPreviewAsset(asset)}
              >
                <img
                  src={asset.url}
                  alt={asset.alt || asset.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleVisibility(asset)}
                      className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
                      title={asset.isActive ? 'Hide' : 'Show'}
                    >
                      {asset.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => openEditModal(asset)}
                      className="p-2 bg-blue-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-blue-600 transition-colors"
                      title="Edit Description"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-medium text-gray-900 truncate">{asset.originalName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{formatFileSize(asset.size)}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                    {SECTIONS.find(s => s.value === asset.section)?.label || asset.section}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setPreviewAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewAsset.url}
                alt={previewAsset.alt || previewAsset.originalName}
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
              <div className="mt-4 text-center text-white">
                <p className="font-semibold">{previewAsset.originalName}</p>
                <p className="text-sm text-white/60">
                  {SECTIONS.find(s => s.value === previewAsset.section)?.label} • {formatFileSize(previewAsset.size)}
                </p>
                {previewAsset.alt && <p className="text-sm text-white/80 mt-2">Alt: {previewAsset.alt}</p>}
                {previewAsset.caption && <p className="text-sm text-white/80">Caption: {previewAsset.caption}</p>}
              </div>
              <button
                onClick={() => setPreviewAsset(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Description Modal */}
        {editingAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setEditingAsset(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Edit Image Description</h3>
                <p className="text-white/80 text-sm">{editingAsset.originalName}</p>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text (for accessibility)
                  </label>
                  <input
                    type="text"
                    value={editForm.alt}
                    onChange={(e) => setEditForm({ ...editForm, alt: e.target.value })}
                    placeholder="Describe the image for screen readers..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used by screen readers and search engines</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Caption (shown in gallery)
                  </label>
                  <textarea
                    value={editForm.caption}
                    onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                    placeholder="Write a description that will appear in the gallery..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">This text will be visible to visitors in the gallery</p>
                </div>

                {/* Image Preview */}
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={editingAsset.url}
                    alt={editForm.alt || editingAsset.originalName}
                    className="w-full h-48 object-contain"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditingAsset(null)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setEditingAsset(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
