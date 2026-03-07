import { 
  Clock, 
  FileText, 
  CalendarDays, 
  BookOpen, 
  PlusCircle, 
  TrendingUp,
  User 
} from "lucide-react";
import { Link } from "react-router";

export const EmployeeOverview = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-1">A summary of your health journey and referral activity.</p>
      </div>

      {/* 2. Top Metric Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Wait Time" 
          value="4 days" 
          subtext="Dr. Michell Micheal" 
          icon={Clock} 
          iconBg="bg-blue-50" 
          iconColor="text-blue-600" 
        />
        <StatCard 
          title="Total Referrals" 
          value="7" 
          subtext="2 pending review" 
          icon={FileText} 
          iconBg="bg-amber-50" 
          iconColor="text-amber-600"
          trend="+2 this month"
        />
        <StatCard 
          title="Upcoming Appointments" 
          value="5" 
          subtext="Next in 4 days" 
          icon={CalendarDays} 
          iconBg="bg-purple-50" 
          iconColor="text-purple-600" 
        />
        <StatCard 
          title="Advice Sheets Accessed" 
          value="3" 
          subtext="This Month" 
          icon={BookOpen} 
          iconBg="bg-emerald-50" 
          iconColor="text-emerald-600"
          trend="+1 last week"
        />
      </div>

      {/* 3. Referral History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Referral History</h3>
          <Link 
            to="/employee/dashboard/submit-referral" 
            className="text-emerald-700 font-medium flex items-center gap-1 hover:text-emerald-800 transition-colors text-sm"
          >
            New referral <PlusCircle size={16} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Referral ID</th>
                <th className="px-6 py-4 font-semibold">Date Submitted</th>
                <th className="px-6 py-4 font-semibold">Service Type</th>
                <th className="px-6 py-4 font-semibold text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <ReferralRow id="REF-882" date="28 Feb 2026" type="Occupational Health" status="Pending" />
              <ReferralRow id="REF-841" date="24 Feb 2026" type="Mental Health" status="In Progress" />
              <ReferralRow id="REF-790" date="18 Feb 2026" type="Physiotherapy" status="Completed" />
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Patient History Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden w-full">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Patient History Timeline</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Appointment Type</th>
                <th className="px-6 py-4 font-semibold">Doctor Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <HistoryRow 
                date="15 Mar 2026" 
                type="Physiotherapy Session" 
                doctor="Dr. Sarah Jenkins" 
                isUpcoming 
              />
              <HistoryRow 
                date="10 Feb 2026" 
                type="Initial Consultation" 
                doctor="Dr. Michael Chen" 
              />
              <HistoryRow 
                date="22 Jan 2026" 
                type="Mental Health Check" 
                doctor="Dr. Elena Rodriguez" 
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const StatCard = ({ title, value, subtext, icon: Icon, iconBg, iconColor, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
    </div>
    <div className="flex items-center gap-2">
      {trend && (
        <span className="flex items-center text-xs font-medium text-emerald-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}
        </span>
      )}
      <span className="text-xs text-slate-400">{subtext}</span>
    </div>
  </div>
);

const ReferralRow = ({ id, date, type, status }) => {
  const statusStyles = {
    'Pending': 'bg-amber-100 text-amber-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700'
  };
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 text-sm text-slate-400 font-mono">{id}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{date}</td>
      <td className="px-6 py-4 font-semibold text-slate-800">{type}</td>
      <td className="px-6 py-4 text-left">
        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${statusStyles[status]}`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

const HistoryRow = ({ date, type, doctor, isUpcoming = false }) => (
  <tr className="hover:bg-slate-50 transition-colors group">
    <td className={`px-6 py-4 font-medium w-1/4 ${isUpcoming ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
      {date}
    </td>
    <td className="px-6 py-4 font-semibold text-slate-800 w-1/3">{type}</td>
    <td className="px-6 py-4 text-slate-600">
      <div className="flex items-center gap-2">
        <User size={14} className="text-slate-300" />
        {doctor}
      </div>
    </td>
  </tr>
);