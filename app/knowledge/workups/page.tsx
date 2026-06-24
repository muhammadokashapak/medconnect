"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Test {
  name: string;
  normalValue: string;
  conditionValue: string;
  clinicalSignificance: string;
}

interface Workup {
  id: string;
  disease: string;
  category: string;
  tests: Test[];
}

export default function WorkupsPage() {
  const [workups, setWorkups] = useState<Workup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/workups")
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setWorkups(data.data);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load workups", err);
        setIsLoading(false);
      });
  }, []);

  const categories = Array.from(new Set(workups.map(w => w.category)));

  const filteredWorkups = workups.filter(w => {
    if (selectedCategory !== "all" && w.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return w.disease.toLowerCase().includes(q) || w.category.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
            <Link href="/knowledge" className="hover:text-blue-600 transition">Knowledge Base</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Diagnostic Workups</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Diagnostic Workups & Pathways</h1>
          <p className="text-gray-600 mt-2">Step-by-step diagnostic algorithms and specific test criteria for major clinical conditions.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Condition</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Sepsis, Diabetes, Heart Attack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pl-10"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Specialty</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="all">All Specialties</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredWorkups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-5xl mb-4">🩺</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No workups found</h3>
            <p className="text-gray-500">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredWorkups.map((workup) => (
              <div key={workup.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{workup.disease}</h2>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                    {workup.category}
                  </span>
                </div>
                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                        <th className="px-6 py-3 font-semibold text-gray-700">Test / Biomarker</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Normal Range</th>
                        <th className="px-6 py-3 font-semibold text-red-600">Diagnostic Value</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Clinical Rationale</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {workup.tests.map((test, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">{test.name}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{test.normalValue}</td>
                          <td className="px-6 py-4 font-semibold text-red-600 text-sm bg-red-50/30">{test.conditionValue}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm">{test.clinicalSignificance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
