"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Video, XCircle, CheckCircle2, ChevronRight, UserCircle2, CalendarPlus, X } from "lucide-react";

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "pending" | "past" | "cancelled">("upcoming");

  // Modal State for Accepting Appointments
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [acceptingApptId, setAcceptingApptId] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<"ACCEPT" | "RESCHEDULE">("ACCEPT");
  const [confirmedDate, setConfirmedDate] = useState("");
  const [confirmedTime, setConfirmedTime] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) setCurrentUser(await profileRes.json());

      const res = await fetch("/api/appointments");
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) router.push("/login");
        return;
      }
      setAppointments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, newDate?: string) => {
    try {
      const payload: any = { appointmentId: id, status };
      if (newDate) payload.scheduledAt = newDate;

      await fetch("/api/appointments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostpone = (appt: any) => {
    const dateObj = new Date(appt.scheduledAt);
    setConfirmedDate(dateObj.toISOString().split("T")[0]);
    setConfirmedTime(dateObj.toTimeString().substring(0, 5));
    setAcceptingApptId(appt.id);
    setModalAction("RESCHEDULE");
    setShowAcceptModal(true);
  };

  const deleteAppointment = async (appt: any) => {
    const otherParty = currentUser?.id === appt.consultantId ? appt.doctor : appt.consultant;
    const otherName = otherParty?.fullName || "the other doctor";
    const dateStr = new Date(appt.scheduledAt).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
    if (!confirm(`Are you sure you want to cancel your meeting with Dr. ${otherName} on ${dateStr}? They will be notified.`)) return;
    try {
      await fetch(`/api/appointments?id=${appt.id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptClick = (appt: any) => {
    const dateObj = new Date(appt.scheduledAt);
    setConfirmedDate(dateObj.toISOString().split("T")[0]);
    setConfirmedTime(dateObj.toTimeString().substring(0, 5));
    setAcceptingApptId(appt.id);
    setModalAction("ACCEPT");
    setShowAcceptModal(true);
  };

  const confirmAccept = async () => {
    if (!acceptingApptId || !confirmedDate || !confirmedTime) return;
    setIsAccepting(true);
    const dateTime = new Date(`${confirmedDate}T${confirmedTime}`);
    const status = modalAction === "RESCHEDULE" ? "POSTPONED" : "ACCEPTED";
    await updateStatus(acceptingApptId, status, dateTime.toISOString());
    setIsAccepting(false);
    setShowAcceptModal(false);
    setAcceptingApptId(null);
  };

  const startVideoCall = async (roomId: string) => {
    try {
      await fetch(`/api/appointments/${roomId}/notify`, { method: "POST" });
    } catch (err) {
      console.error("Error notifying participant:", err);
    }
    router.push(`/video/${roomId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-12 w-64 bg-gray-200 animate-pulse rounded-lg mb-8"></div>
          <div className="flex gap-4">
            <div className="h-12 w-24 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="h-12 w-24 bg-gray-200 animate-pulse rounded-xl"></div>
            <div className="h-12 w-24 bg-gray-200 animate-pulse rounded-xl"></div>
          </div>
          <div className="h-40 bg-white rounded-3xl animate-pulse shadow-sm"></div>
          <div className="h-40 bg-white rounded-3xl animate-pulse shadow-sm"></div>
        </div>
      </div>
    );
  }

  const now = new Date();

  // Categories
  const upcoming = appointments.filter(a => a.status === "ACCEPTED" && new Date(a.scheduledAt) >= now);
  const pending = appointments.filter(a => a.status === "PENDING" || a.status.startsWith("POSTPONED"));
  const past = appointments.filter(a => a.status === "COMPLETED" || (a.status === "ACCEPTED" && new Date(a.scheduledAt) < now));
  const cancelled = appointments.filter(a => a.status === "CANCELLED");

  const getActiveList = () => {
    if (activeTab === "upcoming") return upcoming;
    if (activeTab === "pending") return pending;
    if (activeTab === "past") return past;
    return cancelled;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/30 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 mb-4 text-white">
              <Calendar className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">My Meetings</h1>
            <p className="mt-3 text-lg text-gray-500 max-w-2xl">Manage your upcoming clinical consultations and professional meetings with colleagues.</p>
          </div>
        </div>

        {/* Premium Animated Tabs */}
        <div className="bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl shadow-sm border border-white/50 flex flex-wrap gap-1 mb-10 w-fit mx-auto md:mx-0 relative z-10">
          {[
            { id: "upcoming", label: "Upcoming", count: upcoming.length },
            { id: "pending", label: "Pending", count: pending.length },
            { id: "past", label: "Past", count: past.length },
            { id: "cancelled", label: "Cancelled", count: cancelled.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white text-indigo-700 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-black/5"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/50"
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs font-black transition-colors ${activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-gray-100/80 text-gray-400"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="space-y-6">
          {getActiveList().length === 0 ? (
            <div className="bg-white/40 backdrop-blur-3xl p-16 text-center rounded-[2.5rem] shadow-sm border border-white/60">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CalendarPlus className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">No {activeTab} meetings</h2>
              <p className="text-gray-500 mt-3 text-lg">You're all caught up for now. Enjoy your free time!</p>
            </div>
          ) : (
            getActiveList().map((app) => {
              const isConsultant = currentUser?.id === app.consultantId;
              const otherParty = isConsultant ? app.doctor : app.consultant;
              const apptDate = new Date(app.scheduledAt);
              
              const isPendingForMe = 
                (app.status === "PENDING" && isConsultant) || 
                (app.status === "POSTPONED_BY_DOCTOR" && isConsultant) || 
                (app.status === "POSTPONED_BY_CONSULTANT" && !isConsultant);
                
              const displayStatus = app.status.startsWith("POSTPONED") ? "POSTPONED" : app.status;

              return (
                <div key={app.id} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col lg:flex-row gap-6 lg:items-center justify-between group relative overflow-hidden backdrop-blur-xl">
                  
                  {/* Decorative Gradient Blob (hidden but casts soft shadow) */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none group-hover:opacity-70 transition-opacity"></div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:w-2/3 relative z-10">
                    {/* Date Block */}
                    <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 flex flex-col items-center justify-center shadow-sm">
                      <span className="text-xs font-black text-indigo-500 uppercase tracking-widest">{apptDate.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-3xl font-black text-indigo-700 mt-0.5">{apptDate.getDate()}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-widest ${
                          displayStatus === "PENDING" || displayStatus === "POSTPONED" ? "bg-amber-100/80 text-amber-800 border border-amber-200/50" :
                          displayStatus === "ACCEPTED" ? "bg-emerald-100/80 text-emerald-800 border border-emerald-200/50" :
                          displayStatus === "CANCELLED" ? "bg-rose-100/80 text-rose-800 border border-rose-200/50" :
                          "bg-gray-100/80 text-gray-800 border border-gray-200/50"
                        }`}>
                          {displayStatus}
                        </span>
                        <span className="text-sm font-bold text-gray-500 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 shadow-inner ring-2 ring-white">
                          {otherParty?.profileImage ? (
                            <img src={otherParty.profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-200">
                              <UserCircle2 className="w-7 h-7" />
                            </div>
                          )}
                        </div>
                        <div>
                           <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Dr. {otherParty?.fullName}</h3>
                           <p className="text-sm text-gray-500 font-semibold mt-0.5">{otherParty?.specialization || "General Medicine"}</p>
                        </div>
                      </div>

                      {app.notes && (
                        <div className="mt-4 bg-gray-50/80 rounded-xl p-3.5 text-sm text-gray-600 border border-gray-100/50 backdrop-blur-sm">
                          <span className="font-bold text-gray-800 mr-1">Notes:</span> {app.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-end gap-3 lg:w-1/3 mt-4 lg:mt-0 relative z-10 border-t border-gray-100 lg:border-t-0 pt-4 lg:pt-0">
                    {isPendingForMe && (
                      <div className="flex flex-wrap gap-2 justify-end w-full">
                        <button onClick={() => handleAcceptClick(app)} className="flex-1 lg:flex-none px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Accept
                        </button>
                        <button onClick={() => deleteAppointment(app)} className="flex-1 lg:flex-none px-6 py-2.5 bg-white text-rose-600 border border-rose-200 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 flex items-center justify-center gap-2">
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                      </div>
                    )}

                    {!isPendingForMe && !isConsultant && (
                      <button onClick={() => deleteAppointment(app)} className="w-full lg:w-auto px-6 py-2.5 bg-white text-rose-600 border border-rose-200 rounded-xl text-sm font-bold shadow-sm hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" />
                        {app.status === "ACCEPTED" ? "Cancel Meeting" : "Cancel Request"}
                      </button>
                    )}

                    {app.status === "ACCEPTED" && new Date(app.scheduledAt) >= now && (
                      <div className="flex flex-col gap-2 w-full lg:w-auto">
                        <button onClick={() => startVideoCall(app.id)} className="w-full px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-black tracking-wide shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group/btn">
                          <Video className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                          START MEETING
                        </button>
                        <button onClick={() => handlePostpone(app)} className="w-full px-5 py-2.5 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">Reschedule</button>
                      </div>
                    )}

                    {app.status === "ACCEPTED" && new Date(app.scheduledAt) < now && (
                      <button onClick={() => updateStatus(app.id, "COMPLETED")} className="w-full lg:w-auto px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 hover:bg-black transition-all duration-200">Mark Completed</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Accept Appointment Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-gray-900/60 z-[110] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="px-6 py-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  {modalAction === "RESCHEDULE" ? "Reschedule Meeting" : "Confirm Time"}
                </h3>
                <p className="text-sm text-gray-500 mt-1.5 font-medium">
                  {modalAction === "RESCHEDULE" ? "Select the new date and time." : "Set the exact date and time you are available."}
                </p>
              </div>
              <button onClick={() => setShowAcceptModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                 <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">Date</label>
                <input type="date" value={confirmedDate} onChange={e => setConfirmedDate(e.target.value)} className="w-full border-gray-200 rounded-xl shadow-sm p-3.5 border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50 hover:bg-gray-100/50 transition-colors text-gray-900 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2">Time</label>
                <input type="time" value={confirmedTime} onChange={e => setConfirmedTime(e.target.value)} className="w-full border-gray-200 rounded-xl shadow-sm p-3.5 border focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50 hover:bg-gray-100/50 transition-colors text-gray-900 font-medium" />
              </div>
            </div>
            <div className="px-6 py-5 bg-gray-50/80 border-t border-gray-100 flex justify-end gap-3">
              <button disabled={isAccepting} onClick={() => setShowAcceptModal(false)} className="px-5 py-2.5 text-gray-600 rounded-xl hover:bg-gray-200 font-bold text-sm transition-colors">Cancel</button>
              <button disabled={isAccepting || !confirmedDate || !confirmedTime} onClick={confirmAccept} className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center">
                {isAccepting ? "Confirming..." : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
