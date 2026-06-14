"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function DepartmentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [department, setDepartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/departments/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(setDepartment)
      .catch(() => router.push("/hospitals"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/hospital/${department.hospital.id}`} className="text-indigo-600 font-bold hover:underline flex items-center text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>Back to Homepage</Link>
        </div>

        <div className="bg-white p-8 rounded-xl shadow border border-gray-100 mb-8">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm">
                {department.name.charAt(0)}
             </div>
             <div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{department.name}</h1>
                <p className="text-gray-500 font-medium">{department.hospital.name}</p>
             </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">About Department</h3>
            <p className="text-gray-700 leading-relaxed">{department.description}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center border-b pb-2">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            Department Doctors ({department.memberships.length})
          </h2>
          
          {department.memberships.length === 0 ? (
            <p className="text-gray-500 text-sm">No doctors assigned to this department yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {department.memberships.map((mem: any) => (
                <Link key={mem.id} href={`/doctor/${mem.doctor.id}`} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition bg-white">
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-gray-500">
                     {mem.doctor.profileImage ? (
                       <img src={mem.doctor.profileImage} alt={mem.doctor.fullName} className="w-full h-full object-cover" />
                     ) : (
                       mem.doctor.fullName.charAt(0)
                     )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">Dr. {mem.doctor.fullName}</h3>
                    <p className="text-xs text-gray-500">{mem.doctor.qualification || mem.doctor.specialization || "General"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
