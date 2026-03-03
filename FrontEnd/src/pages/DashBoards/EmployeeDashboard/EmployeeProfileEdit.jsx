import React from "react";
import { User, Bell } from "lucide-react";
import { useNavigate } from "react-router";

export const EmployeeProfileEdit = () => {
  const navigate = useNavigate();

  return (
    /* Matches your bg-[#F1F3F9] and font-sans (Arial) */
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* --- TOP HEADER BAR --- */}
      <header>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
      </header>

      <main className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start">
        
        {/* --- LEFT COLUMN: PROFILE PIC & BUTTONS --- */}
        <section className="w-full md:w-1/4 flex flex-col items-center">
          <div className="w-32 h-32 rounded-full border border-gray-300 overflow-hidden flex items-center justify-center bg-white mb-4">
        {/* Replace the src with your dynamic Google profile URL variable */}
        <img 
            src="https://lh3.googleusercontent.com/a/your-google-profile-id" 
            alt="User Profile" 
            className="w-full h-full object-cover"
            onError={(e) => {
            e.target.src = "https://ui-avatars.com/api/?name=User&background=emerald"; // Fallback if image fails
            }}
        />
    </div>
          
          <div className="bg-[#E2E8F0] px-5 py-0.5 rounded-full text-[11px] font-bold text-gray-600 tracking-wide uppercase mb-8">
            UserID 456
          </div>

          <div className="flex flex-col gap-3 w-full max-w-[160px]">
            <button 
              onClick={() => navigate(-1)}
              className="bg-[#064E3B] text-white py-2 rounded-full text-sm font-bold shadow-md hover:bg-emerald-900 transition-colors"
            >
              Save Changes
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="bg-white text-gray-800 border border-gray-400 py-2 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </section>

        {/* --- RIGHT COLUMN: FORM CARDS --- */}
        <div className="flex-1 space-y-6 w-full">
          
          {/* PERSONAL INFORMATION */}
          <div className="bg-white px-10 py-8 rounded-[40px] shadow-sm">
            <h2 className="text-md font-bold text-gray-800 mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <label className="block text-sm mb-1 font-semibold text-gray-700">Full Name</label>
                <input type="text" defaultValue="John De Lavada" className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-gray-600 bg-white" />
              </div>
              <div>
                <label className="block text-sm mb-1 font-semibold text-gray-700">Gender</label>
                <input type="text" defaultValue="Male" className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-gray-600 bg-white" />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm mb-1 font-semibold text-gray-700">Date of Birth</label>
                <input type="text" defaultValue="2002-05-12" className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-gray-600 bg-white" />
              </div>
            </div>
          </div>

          {/* CONTACT INFORMATION */}
          <div className="bg-white px-10 py-8 rounded-[40px] shadow-sm">
            <h2 className="text-md font-bold text-gray-800 mb-6">Contact Information</h2>
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center">
                <label className="w-36 text-sm font-semibold text-gray-700">Phone Number</label>
                <input type="text" defaultValue="07586900" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-gray-600 bg-white" />
              </div>
              <div className="flex items-center">
                <label className="w-36 text-sm font-semibold text-gray-700">Email</label>
                <input type="email" defaultValue="user@gmail.com" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-gray-600 bg-white" />
              </div>
              <div className="flex items-center">
                <label className="w-36 text-sm font-semibold text-gray-700">Address</label>
                <input type="text" defaultValue="7th RD, Colombo" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-gray-600 bg-white" />
              </div>
            </div>
          </div>

          {/* EMERGENCY CONTACT */}
          <div className="bg-white px-10 py-8 rounded-[40px] shadow-sm">
            <h2 className="text-md font-bold text-gray-800 mb-6">Emergency Contact</h2>
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center">
                <label className="w-36 text-sm font-semibold text-gray-700">Name</label>
                <input type="text" defaultValue="Jasse De Lavada" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-gray-600 bg-white" />
              </div>
              <div className="flex items-center">
                <label className="w-36 text-sm font-semibold text-gray-700">Phone Number</label>
                <input type="text" defaultValue="074XX4578" className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm outline-none focus:border-indigo-400 text-gray-600 bg-white" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};