// src/app/admin/submissions/page.tsx (WITH createClient FIX)
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import Link from 'next/link';

// Interface defining the expected shape of data returned by the RPC function
interface SubmissionAdminView {
    id: number; // Submission ID
    created_at: string;
    user_id: string; // UUID string
    prompt_id: number;
    // These keys must match the aliases/names returned by get_admin_submissions SQL function
    user_email: string | null;
    prompt_genre: string | null;
    prompt_text: string | null;
}

export default async function ViewSubmissionsPage() {
    // --- Read Environment Variables ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // --- Check if variables exist ---
    if (!supabaseUrl || !supabaseKey) {
      console.error("Admin Submissions Page Error: Supabase URL or Anon Key missing!");
      return (
          <div className="container mx-auto p-6 text-center text-red-500">
              Server configuration error. Cannot load submissions.
          </div>
      );
    }

    // --- Create Client ---
    const supabase = createClient();

    // --- Call the database function to get all submissions for admin view ---
    // Ensure the user calling this page is verified as admin via the layout or middleware
    console.log("Fetching admin submissions via RPC...");
    const { data, error } = await supabase
        .rpc('get_admin_submissions'); // Make sure this RPC function exists and works

    // --- Handle RPC Errors ---
    if (error) {
        console.error("Error calling get_admin_submissions RPC:", error.message);
        return (
            <div className="container mx-auto p-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">View Student Submissions</h2>
                    <Link href="/admin" className="text-blue-600 hover:underline text-sm">&larr; Back to Admin Dashboard</Link>
                </div>
                <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200 text-center">
                    Error loading submissions: {error.message}
                </div>
            </div>
        );
    }

    // Ensure data is treated as an array, default to empty array if null/undefined/not array
    const submissions: SubmissionAdminView[] = Array.isArray(data) ? data as SubmissionAdminView[] : [];
    console.log(`Workspaceed ${submissions.length} submissions.`);

    // --- Render the Submissions Table ---
    return (
        <div> {/* Changed from fragment to div for potential styling */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">View Student Submissions</h2>
                 <Link href="/admin" className="text-blue-600 hover:underline text-sm">
                     &larr; Back to Admin Dashboard
                 </Link>
            </div>

             {submissions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No submissions found.</p>
            ) : (
                <div className="overflow-x-auto shadow rounded-lg border border-gray-200"> {/* Added border */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt Genre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt Snippet</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {/* Map over the submissions array */}
                            {submissions.map((sub) => ( // Type is inferred from submissions array
                                <tr key={sub.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                         {sub.created_at ? new Date(sub.created_at).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium"> {/* Made email bold */}
                                        {/* Use email if available, fallback to user_id */}
                                        {sub.user_email ?? `User ID: ${sub.user_id}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {sub.prompt_genre ?? 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={sub.prompt_text ?? ''}> {/* Added title for full text on hover */}
                                        {sub.prompt_text ?? 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {/* Ensure sub.id exists before creating link */}
                                        {sub.id ? (
                                            <Link href={`/admin/submissions/${sub.id}`} className="text-indigo-600 hover:text-indigo-900 hover:underline">View Details</Link>
                                        ) : (
                                            <span className="text-gray-400">No ID</span> // Handle missing ID case
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}