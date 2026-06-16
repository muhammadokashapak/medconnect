"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const handlePostpone = (id: string) => {
    const newDate = prompt("Enter a new proposed date and time (e.g., YYYY-MM-DD HH:MM AM/PM):");
    if (!newDate) return;
    const parsedDate = new Date(newDate);
    if (isNaN(parsedDate.getTime())) {
      alert("Invalid date format. Please try again.");
      return;
    }
    updateStatus(id, "POSTPONED", parsedDate.toISOString());
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await fetch(`/api/appointments?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const startVideoCall = (roomId: string) => {
    router.push(`/video/${roomId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Appointments</h1>

        {appointments.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-xl shadow border border-gray-100">
            <h2 className="text-xl font-bold text-gray-700">No appointments found.</h2>
            <p className="text-gray-500 mt-2">You don't have any upcoming consultations.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {appointments.map((app) => {
                const isConsultant = currentUser?.id === app.consultantId;
                const otherParty = isConsultant ? app.doctor : app.consultant;

                return (
                  <li key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center mb-4 md:mb-0">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold mr-4">
                        {otherParty?.fullName?.charAt(0) || "D"}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Dr. {otherParty?.fullName}</h3>
                        <p className="text-sm text-gray-500">{otherParty?.specialization || "General"}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(app.scheduledAt).toLocaleString()}
                        </p>
                        {app.notes && <p className="text-sm text-gray-600 mt-2 italic">"{app.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                        app.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        app.status === "ACCEPTED" ? "bg-green-100 text-green-800" :
                        app.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {app.status}
                      </span>

                      {isConsultant && app.status === "PENDING" && (
                        <>
                          <button onClick={() => updateStatus(app.id, "ACCEPTED")} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Accept</button>
                          <button onClick={() => updateStatus(app.id, "CANCELLED")} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">Reject</button>
                          <button onClick={() => handlePostpone(app.id)} className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600">Postpone</button>
                        </>
                      )}

                      {!isConsultant && app.status === "PENDING" && (
                        <button onClick={() => deleteAppointment(app.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200">Cancel</button>
                      )}

                      {app.status === "ACCEPTED" && (
                        <>
                          <button onClick={() => startVideoCall(app.id)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                            Join Call
                          </button>
                          <button onClick={() => handlePostpone(app.id)} className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200">Postpone</button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
