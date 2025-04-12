// src/app/admin/submissions/page.tsx (Clean Paste Version)
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// Keep interface for reference and potential use inside map
interface SubmissionAdminView {
    id: number;
    created_at: string;
    user_id: string;
    prompt_id: number;
    // Define based on the actual keys returned by your SQL function's aliases
    user_email: string | null;
    prompt_genre: string | null;
    prompt_text: string | null;
}

export default async function ViewSubmissionsPage() {
    const supabase = await createClient();

    // Call the database function
    const { data, error } = await supabase
        .rpc('get_admin_submissions'); // Use the function confirmed working in SQL Editor

    // Log raw results ONLY if debugging is still needed
    // console.log("Raw RPC Error:", error);
    // console.log("Raw RPC Data:", JSON.stringify(data, null, 2));

    if (error) {
        console.error("Error calling get_admin_submissions RPC:", error.message);
        return <div className="text-red-500 p-4">Error loading submissions: {error.message}</div>;
    }

    // Ensure data is an array before proceeding
    const submissions = Array.isArray(data) ? data : [];

    return (
         <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">View Student Submissions</h2>
                 <Link href="/admin" className="text-blue-600 hover:underline text-sm">
                     &larr; Back to Admin Dashboard
                 </Link>
            </div>

             {submissions.length === 0 ? (
                <p className="text-gray-500">No submissions found.</p>
            ) : (
                <div className="overflow-x-auto shadow rounded-lg">
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
                            {/* Map over the submissions array, using the interface type */}
                            {submissions.map((sub: SubmissionAdminView) => (
                                <tr key={sub.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                         {sub.created_at ? new Date(sub.created_at).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {/* Access properties directly from sub, using correct keys */}
                                        {sub.user_email ?? sub.user_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {sub.prompt_genre ?? 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                                        {sub.prompt_text ?? 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {/* Ensure sub.id exists before creating link */}
                                        {sub.id ? (
                                            <Link href={`/admin/submissions/${sub.id}`} className="text-indigo-600 hover:text-indigo-900">View Details</Link>
                                        ) : null}
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