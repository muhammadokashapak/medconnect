"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Unauthorized");
      setEvents(await res.json());
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}/register`, { method: "POST" });
      if (res.ok) {
        toast.success("Successfully registered for the event!");
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to register.");
      }
    } catch (error) {
      toast.error("Error registering");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Hospital Events
          </h1>
          <Link href="/feed" className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center">Back to Homepage</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                <p className="text-gray-500 text-lg">No upcoming events available.</p>
              </div>
            ) : (
              events.map(evt => {
                const isRegistered = evt.attendees.length > 0;
                return (
                  <div key={evt.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{evt.title}</h2>
                      <p className="text-sm text-gray-500 font-medium mb-4">{evt.hospital.name}</p>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{evt.description}</p>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                           <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                           {new Date(evt.date).toLocaleString()}
                        </div>
                        {evt.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            {evt.location}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                           <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                           {evt._count.attendees} Attending
                        </div>
                      </div>
                    </div>
                    {isRegistered ? (
                      <div className="w-full text-center bg-red-50 text-red-700 font-bold py-2 rounded border border-red-200">
                        ✓ Registered
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleRegister(evt.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition"
                      >
                        Register for Event
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
