export default function PatientPortal() {
  return (
    <div className="min-h-screen bg-blue-50 py-20 px-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Portal Access</h1>
        <p className="text-gray-500 text-sm mb-8">
          Welcome to the patient portal. Please log in with your MRN and phone number to view your medical records, prescriptions, and upcoming appointments.
        </p>
        
        <form className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Medical Record Number (MRN)</label>
            <input type="text" placeholder="e.g. MRN-1001" className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input type="text" placeholder="e.g. 555-0101" className="w-full border-gray-300 border p-3 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-sm mt-4">
            Access My Records
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">
            Powered by MedConnect Health Systems
          </p>
        </div>
      </div>
    </div>
  );
}
