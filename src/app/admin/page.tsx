// src/app/admin/page.tsx
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>
      <p className="mb-6">Welcome to the admin area. Use the links below to manage application content.</p>
      <nav>
        <ul className="space-y-3">
          <li>
            <Link href="/admin/prompts" className="text-blue-600 hover:text-blue-800 hover:underline">
              Manage Writing Prompts
            </Link>
             <p className="text-sm text-gray-500">Add, edit, activate, or delete writing prompts.</p>
          </li>
          <li>
            <Link href="/admin/submissions" className="text-blue-600 hover:text-blue-800 hover:underline">
              View Student Submissions
            </Link>
             <p className="text-sm text-gray-500">Browse and view submissions made by students.</p>
          </li>
          {/* Add links to other admin sections here later (e.g., user management) */}
        </ul>
      </nav>
    </div>
  );
}