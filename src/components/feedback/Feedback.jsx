import React, { useState } from 'react';
import Sidebar from '../common/Sidebar';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Button from '../common/Button';
import Input from '../common/Input';
import {
  MessageSquare, AlertTriangle, Lightbulb, Smartphone,
  MoreHorizontal, Star, Send, Lock, Check,
} from 'lucide-react';
import { submitFeedback } from '../../services/feedbackStorage';
import toast from 'react-hot-toast';

const feedbackTypes = [
  { id: 'general', icon: MessageSquare, label: 'General Feedback' },
  { id: 'issue', icon: AlertTriangle, label: 'Report an Issue' },
  { id: 'feature', icon: Lightbulb, label: 'Feature Suggestion' },
  { id: 'experience', icon: Smartphone, label: 'App Experience' },
  { id: 'other', icon: MoreHorizontal, label: 'Other' },
];

const Feedback = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');
  const [wantResponse, setWantResponse] = useState(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedType) {
      toast.error('Please choose what your feedback is about');
      return;
    }
    if (rating === 0) {
      toast.error('Please rate your experience');
      return;
    }
    if (!comments.trim()) {
      toast.error('Please tell us more about your experience');
      return;
    }

    setLoading(true);
    try {
      await submitFeedback({
        type: selectedType,
        rating,
        comments,
        wantResponse: wantResponse === true,
        email,
      });

      toast.success('Thank you for your feedback!');
      setSelectedType('');
      setRating(0);
      setComments('');
      setWantResponse(null);
      setEmail('');
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-secondary-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} title="Feedback" />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="font-display text-2xl font-bold text-secondary-900 mb-2">
                Share Your Feedback
              </h1>
              <p className="text-secondary-500">
                Help us improve SafeRoute Connect by sharing your experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-8">
              {/* Question 1 */}
              <div>
                <h3 className="font-medium text-secondary-900 mb-3">
                  1. What is your feedback about? <span className="text-danger-500">*</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {feedbackTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md 
                        ${selectedType === type.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-secondary-200 bg-white hover:border-primary-300'}`}
                    >
                      <type.icon className={`w-5 h-5 ${selectedType === type.id ? 'text-primary-600' : 'text-secondary-400'}`} />
                      <span className={`text-xs font-medium text-center ${selectedType === type.id ? 'text-primary-700' : 'text-secondary-600'}`}>
                        {type.label}
                      </span>
                      {selectedType === type.id && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <h3 className="font-medium text-secondary-900 mb-3">
                  2. Please rate your overall experience <span className="text-danger-500">*</span>
                </h3>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star className={`w-8 h-8 ${star <= (hoverRating || rating) ? 'fill-warning-400 text-warning-400' : 'text-secondary-300'}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-secondary-600">
                    {rating > 0 ? `${rating} out of 5` : 'Tap to rate'}
                  </span>
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <h3 className="font-medium text-secondary-900 mb-3">
                  3. Tell us more <span className="text-danger-500">*</span>
                </h3>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={5}
                  className="input-field resize-none"
                />
              </div>

              {/* Question 4 */}
              <div>
                <h3 className="font-medium text-secondary-900 mb-3">4. Would you like a response?</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-secondary-200 hover:border-primary-300 cursor-pointer">
                    <input
                      type="radio"
                      name="wantResponse"
                      checked={wantResponse === true}
                      onChange={() => setWantResponse(true)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm text-secondary-700">Yes, please respond</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-secondary-200 hover:border-primary-300 cursor-pointer">
                    <input
                      type="radio"
                      name="wantResponse"
                      checked={wantResponse === false}
                      onChange={() => setWantResponse(false)}
                      className="w-4 h-4 text-primary-600"
                    />
                    <span className="text-sm text-secondary-700">No, thanks</span>
                  </label>
                </div>
              </div>

              {wantResponse === true && (
                <Input
                  placeholder="Enter your email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Send}
                />
              )}

              <div className="flex items-start gap-3 p-4 bg-primary-50 rounded-xl">
                <Lock className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-700">Your privacy matters</p>
                  <p className="text-xs text-primary-600 mt-0.5">Your feedback is confidential.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1" icon={Send}>
                  Submit Feedback
                </Button>
                <Button type="button" variant="secondary" size="lg" onClick={() => window.history.back()}>
                  Cancel
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

export default Feedback;