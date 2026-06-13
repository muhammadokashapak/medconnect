"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrganizationsPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/organizations");
      if (!res.ok) throw new Error("Unauthorized");
      setOrganizations(await res.json());
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id: string) => {
    try {
      const res = await fetch(`/api/organizations/${id}/join`, { method: "POST" });
      if (res.ok) {
        alert("Joined successfully!");
        fetchData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to join.");
      }
    } catch (error) {
      alert("Error joining organization");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Professional Organizations
          </h1>
          <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-800">
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                <p className="text-gray-500 text-lg">No organizations available.</p>
              </div>
            ) : (
              organizations.map(org => {
                const isMember = org.memberships.length > 0;
                return (
                  <div key={org.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">
                          {org.name.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-1 rounded">
                          {org.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                        {org.name}
                      </h2>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{org.description}</p>
                      
                      <div className="flex gap-4 mb-4 text-sm text-gray-500">
                        <div className="flex items-center">
                           <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                           {org._count.memberships} Members
                        </div>
                      </div>
                    </div>
                    {isMember ? (
                      <div className="w-full text-center bg-emerald-50 text-emerald-700 font-bold py-2 rounded border border-emerald-200">
                        ✓ Member
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleJoin(org.id)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded transition"
                      >
                        Join Organization
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
