import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Button from '../common/Button';
import Input from '../common/Input';
import { ArrowLeft, MapPin, Camera, Image, Shield, AlertTriangle, Info, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { addIncident } from '../../services/incidentStorage';

const incidentTypes = [
  { id: 'theft', label: 'Theft', emoji: '🛡️' },
  { id: 'harassment', label: 'Harassment', emoji: '⚠️' },
  { id: 'suspicious', label: 'Suspicious Behaviour', emoji: '🔍' },
  { id: 'poor_lighting', label: 'Poor Lighting', emoji: '💡' },
  { id: 'vandalism', label: 'Vandalism', emoji: '🔨' },
  { id: 'other', label: 'Other', emoji: '•••' },
];

const ReportIncident = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [formData, setFormData] = useState({
    incidentType: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    address: '',
    anonymous: false,
  });

  // Get today's date as YYYY-MM-DD for the max attribute
  const today = new Date().toISOString().split('T')[0];

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto({ name: file.name, dataUrl: event.target.result });
      toast.success('Photo added!');
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    toast.success('Photo removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.incidentType || !formData.description || !formData.address) {
      toast.error('Please fill in required fields');
      return;
    }

    // ⭐ Validate: date can't be in the future
    const selectedDate = new Date(formData.date + 'T00:00:00');
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    if (selectedDate > todayDate) {
      toast.error('Incident date cannot be in the future');
      return;
    }

    // ⭐ Validate: time can't be in the future (if date is today)
    if (selectedDate.getTime() === todayDate.getTime()) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      
      if (selectedDateTime > now) {
        toast.error('Incident time cannot be in the future');
        return;
      }
    }

    setLoading(true);
    try {
      const loadingToast = photo
        ? toast.loading('Uploading photo and saving incident...')
        : toast.loading('Saving incident...');

      const newIncident = await addIncident({
        type: formData.incidentType,
        description: formData.description,
        location: formData.address,
        address: formData.address,
        anonymous: formData.anonymous,
        reportedBy: 'You',
        photoUrl: photo?.dataUrl || null,
      });

      toast.dismiss(loadingToast);
      console.log('[SafeRoute] Incident saved:', newIncident);
      toast.success('Incident reported successfully!');
      navigate('/incidents');
    } catch (error) {
      console.error('[SafeRoute] Failed to save incident:', error);
      toast.error(error.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Report Incident" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm font-medium text-secondary-600 hover:text-primary-600 mb-6">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="mb-8">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-secondary-900 mb-2">
                Report Incident
              </h1>
              <p className="text-secondary-500">
                Help keep your community safe by reporting safety incidents.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Incident Details */}
              <div className="card">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="font-display font-semibold text-secondary-900">
                    1. Incident Details
                  </h2>
                  <span className="text-danger-500 ml-auto text-sm">* Required</span>
                </div>

                {/* Incident Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Incident Type <span className="text-danger-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {incidentTypes.map((type) => (
                      <button key={type.id} type="button"
                        onClick={() => setFormData({ ...formData, incidentType: type.id })}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md 
                          ${formData.incidentType === type.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-secondary-200 bg-white hover:border-primary-300'}`}>
                        <span className="text-2xl">{type.emoji}</span>
                        <span className={`text-xs font-medium text-center ${formData.incidentType === type.id ? 'text-primary-700' : 'text-secondary-600'}`}>
                          {type.label}
                        </span>
                        {formData.incidentType === type.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Description <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about what happened..."
                    rows={4}
                    maxLength={500}
                    className="input-field resize-none"
                  />
                  <p className="text-xs text-secondary-400 text-right mt-1">
                    {formData.description.length}/500
                  </p>
                </div>

                {/* Date and Time — WITH FIX */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="When did it happen?" 
                    name="date" 
                    type="date"
                    max={today}
                    value={formData.date} 
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    required 
                  />
                  <Input 
                    label="Time" 
                    name="time" 
                    type="time"
                    value={formData.time} 
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
                    required 
                  />
                </div>
                <p className="text-xs text-secondary-400 mt-2">
                  
                </p>
              </div>

              {/* Section 2: Location */}
              <div className="card">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="font-display font-semibold text-secondary-900">
                    2. Location
                  </h2>
                  <span className="text-danger-500 ml-auto text-sm">* Required</span>
                </div>

                <div className="relative h-48 bg-secondary-100 rounded-xl overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                    <div className="w-8 h-8 bg-danger-500 rounded-full border-4 border-white shadow-lg" />
                  </div>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-secondary-500 mb-4">
                  <Info className="w-3 h-3" /> Enter the exact location where the incident happened
                </p>

                <Input 
                  label="Address / Location Details" 
                  name="address" 
                  icon={MapPin}
                  placeholder="e.g., SPU Main Gate, Chapel Street, Kimberley"
                  value={formData.address} 
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                  required 
                />
              </div>

              {/* Section 3: Evidence & Privacy */}
              <div className="card">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="font-display font-semibold text-secondary-900">
                    3. Evidence & Privacy
                  </h2>
                </div>

                {!photo ? (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-secondary-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                      <Camera className="w-5 h-5 text-secondary-400" />
                      <span className="text-sm font-medium text-secondary-600">Take Photo</span>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
                    </label>
                    <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-secondary-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                      <Image className="w-5 h-5 text-secondary-400" />
                      <span className="text-sm font-medium text-secondary-600">Choose from Gallery</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                    </label>
                  </div>
                ) : (
                  <div className="relative mb-4 rounded-xl overflow-hidden border border-secondary-200">
                    <img src={photo.dataUrl} alt="Preview" className="w-full h-48 object-cover" />
                    <button type="button" onClick={removePhoto}
                      className="absolute top-2 right-2 w-8 h-8 bg-danger-500 hover:bg-danger-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                      title="Remove photo">
                      ✕
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md truncate max-w-[80%]">
                      {photo.name}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-secondary-50 rounded-xl">
                  <input type="checkbox" checked={formData.anonymous}
                    onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
                    className="mt-0.5 w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                  <div>
                    <label className="text-sm font-medium text-secondary-700">Report Anonymously</label>
                    <p className="text-xs text-secondary-500 mt-0.5">
                      Your personal information will be hidden from public view.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1" icon={Shield}>
                  SUBMIT REPORT
                </Button>
                <Button type="button" variant="secondary" size="lg" onClick={() => navigate(-1)} className="sm:w-40">
                  CANCEL
                </Button>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ReportIncident;