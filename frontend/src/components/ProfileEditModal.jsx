import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "../lib/api";
import toast from "react-hot-toast";
import { UserIcon } from "lucide-react";
import Portal from "./Portal";

const ProfileEditModal = ({ isOpen, onClose, initialUser }) => {
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    fullName: "",
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    location: "",
    profilePic: "",
  });

  const { mutate: updateProfileMutation, isPending } = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      // Update the cache with the server response
      queryClient.setQueryData(["authUser"], (old) => {
        if (!old) return old;
        return {
          ...old,
          user: data.user,
        };
      });
      
      // Invalidate stream token to force re-initialization with new user data
      queryClient.invalidateQueries({ queryKey: ["streamToken"] });
      
      toast.success("Profile updated successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  useEffect(() => {
    if (initialUser) {
      setFormState({
        fullName: initialUser.fullName || "",
        bio: initialUser.bio || "",
        nativeLanguage: initialUser.nativeLanguage || "",
        learningLanguage: initialUser.learningLanguage || "",
        location: initialUser.location || "",
        profilePic: initialUser.profilePic || "",
      });
    }
  }, [initialUser]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((s) => ({ ...s, [name]: value }));
  };

  const handleSave = () => {
    // Save to server - will update cache on success
    updateProfileMutation(formState);
  };

  if (!isOpen) return null;

  return (
    <Portal>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 z-[9998] animate-fade-in" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pointer-events-none animate-fade-in overflow-hidden">
        <div className="bg-base-200 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border-2 border-base-300/50 animate-scale-in flex flex-col pointer-events-auto">
          {/* Content Wrapper - Fixed Header */}
          <div className="p-4 sm:p-5 md:p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-xl sm:rounded-2xl shadow-lg">
                  <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                  Edit Profile
                </h2>
              </div>
              <button
                onClick={onClose}
                className="btn btn-ghost btn-sm btn-circle hover:bg-error/10 hover:text-error hover:rotate-90 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent px-4 sm:px-5 md:px-6">
            <div className="space-y-3 sm:space-y-4 py-2">
            {/* Profile Picture Preview */}
            {formState.profilePic && (
              <div className="flex justify-center py-2 sm:py-3">
                <div className="avatar">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-white shadow-xl hover:ring-offset-6 transition-all">
                    <img src={formState.profilePic} alt="Profile Preview" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <label className="label py-1 px-0">
                  <span className="label-text font-semibold text-sm">Full name</span>
                </label>
                <input
                  name="fullName"
                  value={formState.fullName}
                  onChange={handleChange}
                  className="input input-bordered w-full text-sm h-11 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-base-100 rounded-xl shadow-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <label className="label py-1 px-0">
                  <span className="label-text font-semibold text-sm">Profile picture URL</span>
                </label>
                <input
                  name="profilePic"
                  value={formState.profilePic}
                  onChange={handleChange}
                  className="input input-bordered w-full text-sm h-11 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-base-100 rounded-xl shadow-sm"
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div className="sm:col-span-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <label className="label py-1 px-0">
                  <span className="label-text font-semibold text-sm">Bio</span>
                  <span className="badge badge-primary badge-sm">{formState.bio.length}/150</span>
                </label>
                <textarea
                  name="bio"
                  value={formState.bio}
                  onChange={handleChange}
                  className="textarea textarea-bordered w-full text-sm hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all resize-none bg-base-100 min-h-[70px] rounded-xl shadow-sm"
                  rows={3}
                  maxLength={150}
                  placeholder="Tell others about yourself..."
                />
              </div>

              <div>
                <label className="label py-1 px-0">
                  <span className="label-text font-semibold text-sm">Native language</span>
                </label>
                <select
                  name="nativeLanguage"
                  value={formState.nativeLanguage}
                  onChange={handleChange}
                  className="select select-bordered w-full text-sm h-11 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-base-100 rounded-xl shadow-sm"
                >
                <option value="">Select native language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Russian">Russian</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Arabic">Arabic</option>
                <option value="Hindi">Hindi</option>
                <option value="Dutch">Dutch</option>
                <option value="Swedish">Swedish</option>
                <option value="Norwegian">Norwegian</option>
                <option value="Danish">Danish</option>
                <option value="Finnish">Finnish</option>
                <option value="Polish">Polish</option>
                <option value="Czech">Czech</option>
                <option value="Hungarian">Hungarian</option>
                <option value="Turkish">Turkish</option>
                <option value="Greek">Greek</option>
                <option value="Hebrew">Hebrew</option>
                <option value="Thai">Thai</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Indonesian">Indonesian</option>
                <option value="Malay">Malay</option>
                <option value="Tagalog">Tagalog</option>
                <option value="Swahili">Swahili</option>
                <option value="Other">Other</option>
              </select>
            </div>

              <div>
                <label className="label py-1 px-0">
                  <span className="label-text font-semibold text-sm">Learning language</span>
                </label>
                <select
                  name="learningLanguage"
                  value={formState.learningLanguage}
                  onChange={handleChange}
                  className="select select-bordered w-full text-sm h-11 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-base-100 rounded-xl shadow-sm"
                >
                <option value="">Select learning language</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Russian">Russian</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Korean">Korean</option>
                <option value="Arabic">Arabic</option>
                <option value="Hindi">Hindi</option>
                <option value="Dutch">Dutch</option>
                <option value="Swedish">Swedish</option>
                <option value="Norwegian">Norwegian</option>
                <option value="Danish">Danish</option>
                <option value="Finnish">Finnish</option>
                <option value="Polish">Polish</option>
                <option value="Czech">Czech</option>
                <option value="Hungarian">Hungarian</option>
                <option value="Turkish">Turkish</option>
                <option value="Greek">Greek</option>
                <option value="Hebrew">Hebrew</option>
                <option value="Thai">Thai</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Indonesian">Indonesian</option>
                <option value="Malay">Malay</option>
                <option value="Tagalog">Tagalog</option>
                <option value="Swahili">Swahili</option>
                <option value="Other">Other</option>
              </select>
            </div>

              <div className="sm:col-span-2">
                <label className="label py-1 px-0">
                  <span className="label-text font-semibold text-sm">Location</span>
                </label>
                <input
                  name="location"
                  value={formState.location}
                  onChange={handleChange}
                  className="input input-bordered w-full text-sm h-11 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all bg-base-100 rounded-xl shadow-sm"
                  placeholder="City, Country"
                />
              </div>
            </div>
            </div>
          </div>

          {/* Fixed Footer with Buttons */}
          <div className="flex-shrink-0 px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t-2 border-primary/20">
              <button 
                className="btn btn-ghost w-full sm:w-auto sm:min-w-[120px] h-11 text-sm rounded-xl font-medium" 
                onClick={onClose} 
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary w-full sm:w-auto sm:min-w-[120px] shadow-lg hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all h-11 text-sm rounded-xl font-medium" 
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ProfileEditModal;
