"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-medium">Loading Dashboard...</div>;
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
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">My Appointments</h1>
            <p className="mt-2 text-sm text-gray-500">Manage your consultations and schedule with ease.</p>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-1 mb-8 w-fit mx-auto md:mx-0">
          {[
            { id: "upcoming", label: "Upcoming", count: upcoming.length },
            { id: "pending", label: "Pending", count: pending.length },
            { id: "past", label: "Past", count: past.length },
            { id: "cancelled", label: "Cancelled", count: cancelled.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? "bg-indigo-200 text-indigo-800" : "bg-gray-100 text-gray-600"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="space-y-4">
          {getActiveList().length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">No {activeTab} appointments</h2>
              <p className="text-gray-500 mt-2">You're all caught up for now.</p>
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
                <div key={app.id} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 md:items-center justify-between group relative overflow-hidden">
                  
                  {/* Left accent border */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    displayStatus === "PENDING" || displayStatus === "POSTPONED" ? "bg-yellow-400" :
                    displayStatus === "ACCEPTED" ? "bg-emerald-500" :
                    displayStatus === "CANCELLED" ? "bg-rose-500" : "bg-gray-300"
                  }`}></div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:w-2/3">
                    {/* Date Block */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{apptDate.toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-2xl font-black text-indigo-700">{apptDate.getDate()}</span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wide ${
                          displayStatus === "PENDING" || displayStatus === "POSTPONED" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                          displayStatus === "ACCEPTED" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" :
                          displayStatus === "CANCELLED" ? "bg-rose-100 text-rose-800 border border-rose-200" :
                          "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}>
                          {displayStatus}
                        </span>
                        <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                          {otherParty?.profileImage ? (
                            <img src={otherParty.profileImage} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-indigo-100 text-indigo-600">
                              {otherParty?.fullName?.charAt(0) || "D"}
                            </div>
                          )}
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-gray-900 leading-tight">Dr. {otherParty?.fullName}</h3>
                           <p className="text-sm text-gray-500 font-medium">{otherParty?.specialization || "General Medicine"}</p>
                        </div>
                      </div>

                      {app.notes && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-100">
                          <span className="font-semibold text-gray-700">Notes:</span> {app.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-end gap-2 md:w-1/3 mt-4 md:mt-0">
                    {isPendingForMe && (
                      <div className="flex flex-wrap gap-2 justify-end w-full">
                        <button onClick={() => updateStatus(app.id, "ACCEPTED")} className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 hover:shadow transition-all">Accept</button>
                        <button onClick={() => deleteAppointment(app)} className="flex-1 md:flex-none px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg text-sm font-bold shadow-sm hover:bg-rose-50 transition-all">Delete</button>
                      </div>
                    )}

                    {!isPendingForMe && !isConsultant && (
                      <button onClick={() => deleteAppointment(app)} className="w-full md:w-auto px-4 py-2 bg-white text-rose-600 border border-rose-200 rounded-lg text-sm font-bold shadow-sm hover:bg-rose-50 transition-all">
                        {app.status === "ACCEPTED" ? "Delete Meeting" : "Cancel Request"}
                      </button>
                    )}

                    {app.status === "ACCEPTED" && new Date(app.scheduledAt) >= now && (
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <button onClick={() => startVideoCall(app.id)} className="w-full px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 hover:shadow-md transition-all flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          Join Meeting
                        </button>
                        <button onClick={() => handlePostpone(app)} className="w-full px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all">Reschedule</button>
                      </div>
                    )}

                    {app.status === "ACCEPTED" && new Date(app.scheduledAt) < now && (
                      <button onClick={() => updateStatus(app.id, "COMPLETED")} className="w-full md:w-auto px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-900 transition-all">Mark Completed</button>
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
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900">
                {modalAction === "RESCHEDULE" ? "Reschedule Appointment" : "Confirm Appointment"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {modalAction === "RESCHEDULE" ? "Select the new date and time." : "Set the exact date and time you are available."}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                <input type="date" value={confirmedDate} onChange={e => setConfirmedDate(e.target.value)} className="w-full border-gray-300 rounded-xl shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Time</label>
                <input type="time" value={confirmedTime} onChange={e => setConfirmedTime(e.target.value)} className="w-full border-gray-300 rounded-xl shadow-sm p-3 border focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 text-gray-900" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button disabled={isAccepting} onClick={() => setShowAcceptModal(false)} className="px-5 py-2.5 text-gray-600 rounded-xl hover:bg-gray-200 font-bold text-sm transition-colors">Cancel</button>
              <button disabled={isAccepting || !confirmedDate || !confirmedTime} onClick={confirmAccept} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm shadow-sm transition-all disabled:opacity-50 flex items-center">
                {isAccepting ? "Confirming..." : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
