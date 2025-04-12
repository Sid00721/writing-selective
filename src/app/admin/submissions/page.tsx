// src/app/admin/submissions/page.tsx
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

// Define type for the joined data we expect
interface SubmissionAdminView {
  id: number; // Or string
  created_at: string;
  user_id: string; // UUID
  prompt_id: number; // Or string
  // Joined data - allow for null if join fails or user/prompt deleted
  users: {
    email: string | null;
  } | null;
  prompts: {
    genre: string | null;
    prompt_text: string | null;
  } | null;
  // content_json is not selected in this list view for brevity
}

export default async function ViewSubmissionsPage() {
    const supabase = await createClient();

    // Admin check is handled by the layout, but RLS ensures data access

    // Fetch all submissions, joining user email and prompt info
    const { data: submissions, error } = await supabase
        .from('submissions')
        .select(`
            id,
            created_at,
            user_id,
            prompt_id,
            users ( email ),
            prompts ( genre, prompt_text )
        `)
        .order('created_at', { ascending: false }); // Newest first

    if (error) {
        console.error("Error fetching submissions:", error.message);
        return <div className="text-red-500 p-4">Error loading submissions. Please ensure Admins have SELECT permission via RLS on submissions, auth.users, and prompts tables.</div>;
    }

    const typedSubmissions = submissions || []; // Let TypeScript infer the type

    return (
         <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">View Student Submissions</h2>
                 <Link href="/admin" className="text-blue-600 hover:underline text-sm">
                     &larr; Back to Admin Dashboard
                 </Link>
            </div>

             {typedSubmissions.length === 0 ? (
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
                            {typedSubmissions.map((sub) => (
                                <tr key={sub.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                         {new Date(sub.created_at).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                       {sub.users?.[0]?.email ?? sub.user_id} {/* Access first element */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {sub.prompts?.[0]?.genre ?? 'N/A'} {/* Access first element */}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate"> {/* Truncate long text */}
                                        {sub.prompts?.[0]?.prompt_text ?? 'N/A'} {/* Access first element */}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                         {/* Link to the same student view page */}
                                        <Link href={`/submission/${sub.id}`} className="text-indigo-600 hover:text-indigo-900">View Details</Link>
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