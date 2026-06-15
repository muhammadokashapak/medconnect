"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GuidelinesPage() {
  const router = useRouter();
  const [guidelines, setGuidelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ title: "", specialty: "Cardiology", version: "", description: "", content: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specialties = [
    "All", "Cardiology", "Neurology", "Pulmonology", "Endocrinology", "Gastroenterology",
    "Dermatology", "Orthopedics", "Pediatrics", "Gynecology",
    "Psychiatry", "Emergency Medicine"
  ];

  useEffect(() => {
    fetchData();
  }, [specialty]);

  const fetchData = async () => {
    setLoading(true);
    let url = "/api/guidelines?";
    if (query) url += `query=${encodeURIComponent(query)}&`;
    if (specialty && specialty !== "All") url += `specialty=${encodeURIComponent(specialty)}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Unauthorized");
      setGuidelines(await res.json());
    } catch (err) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleAddGuideline = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Failed to add guideline");
      setShowAddModal(false);
      setFormData({ title: "", specialty: "Cardiology", version: "", description: "", content: "" });
      fetchData(); // Refresh list
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Clinical Guidelines Library
          </h1>
          <div className="flex space-x-4">
            <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              Add Guideline
            </button>
            <button onClick={() => router.push("/feed")} className="text-sm font-medium text-gray-600 hover:text-gray-800 self-center">Back</button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="Search guidelines by title or description..." 
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <select 
                className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              >
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guidelines.length === 0 ? (
              <div className="col-span-full text-center py-10 bg-white rounded-xl shadow border border-gray-100">
                <p className="text-gray-500 text-lg">No guidelines found matching your criteria.</p>
              </div>
            ) : (
              guidelines.map(g => (
                <div key={g.id} className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                        {g.specialty}
                      </span>
                      <span className="text-gray-400 text-xs font-mono">v{g.version}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight">{g.title}</h2>
                    <p className="text-xs text-gray-500 mb-3 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                      {g.doctor ? `Dr. ${g.doctor.fullName}` : "System Verified"}
                    </p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{g.description}</p>
                  </div>
                  <Link href={`/guidelines/${g.id}`} className="text-blue-600 font-bold text-sm hover:underline flex items-center">
                    Read Guideline <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Guideline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Guideline</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleAddGuideline} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full border-gray-300 border p-3 rounded-lg" placeholder="e.g. Asthma Management 2026" />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <select required value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} className="w-full border-gray-300 border p-3 rounded-lg">
                    {specialties.filter(s => s !== "All").map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Version/Year</label>
                  <input required type="text" value={formData.version} onChange={e => setFormData({ ...formData, version: e.target.value })} className="w-full border-gray-300 border p-3 rounded-lg" placeholder="e.g. 2026.1" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border-gray-300 border p-3 rounded-lg" rows={2} placeholder="Brief summary of the guideline..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Content (Markdown Supported)</label>
                <textarea required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full border-gray-300 border p-3 rounded-lg" rows={6} placeholder="Detailed protocol, diagnostic criteria, etc..."></textarea>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-gray-800 font-medium py-2 px-4 mr-2">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Publish Guideline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
