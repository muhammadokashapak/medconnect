const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "app/activity/page.tsx",
  "app/ai/page.tsx",
  "app/analytics/page.tsx",
  "app/announcements/page.tsx",
  "app/cme/page.tsx",
  "app/events/page.tsx",
  "app/hospital-admin/page.tsx",
  "app/hospitals/page.tsx",
  "app/learning/page.tsx",
  "app/notifications/page.tsx",
  "app/organizations/page.tsx",
  "app/saved-cases/page.tsx",
  "app/verification/page.tsx"
];

for (const file of filesToUpdate) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace text and routes
    content = content.replace(/>Back to Dashboard</g, ">Back to Feed<");
    content = content.replace(/"\/dashboard"/g, '"/feed"');

    // Make layout responsive
    content = content.replace(/className="flex justify-between items-center mb-6"/g, 'className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"');
    content = content.replace(/className="flex justify-between items-center mb-8"/g, 'className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"');

    // Make link/button look like a button
    content = content.replace(/className="text-sm font-medium text-gray-600 hover:text-gray-800"/g, 'className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium w-full sm:w-auto text-center"');
    content = content.replace(/className="text-blue-600 hover:underline inline-block mb-4"/g, 'className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition font-medium inline-block mb-4 w-full sm:w-auto text-center"');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated", file);
  }
}
