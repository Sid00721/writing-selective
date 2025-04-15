// src/app/admin/prompts/page.tsx (WITH createClient FIX)
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import Link from 'next/link';
import DeletePromptButton from '@/components/DeletePromptButton'; // Assuming this component exists
import { redirect } from 'next/navigation'; // Although not used here, good practice if needed later

// Define type for prompts based on your table columns
interface Prompt {
    id: number; // Or string if UUID
    created_at: string;
    genre: string;
    prompt_text: string;
    is_active: boolean;
}

export default async function ManagePromptsPage() {
    // --- Read Environment Variables ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // --- Check if variables exist ---
    if (!supabaseUrl || !supabaseKey) {
      console.error("Manage Prompts Page Error: Supabase URL or Anon Key missing!");
      return (
          <div className="container mx-auto p-6 text-center text-red-500">
              Server configuration error. Cannot load prompts.
          </div>
      );
    }

    // --- Create Client by PASSING variables (without await) ---
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Assuming AdminLayout handles the overall admin check

    console.log("Fetching all prompts for admin...");
    // Fetch all prompts (Admins should have SELECT permission via RLS or table grants)
    const { data: prompts, error } = await supabase
        .from('prompts')
        .select('*')
        .order('genre', { ascending: true }) // Order by genre first
        .order('created_at', { ascending: false }); // Then by creation date

    if (error) {
        console.error("Error fetching prompts:", error.message);
        // Render an error message
        return (
             <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Manage Writing Prompts</h2>
                    {/* Add link back to admin home? */}
                </div>
                <div className="text-red-500 p-4 bg-red-50 rounded border border-red-200 text-center">
                    Error loading prompts: {error.message}
                 </div>
            </div>
        );
    }

    // Type cast or default to empty array
    const typedPrompts = prompts as Prompt[] || [];
    console.log(`Workspaceed ${typedPrompts.length} prompts.`);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manage Writing Prompts</h2>
                <Link href="/admin/prompts/new" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm shadow-sm transition duration-150">
                    + Add New Prompt
                </Link>
            </div>

            {/* Conditional rendering for table or "No prompts" message */}
            {typedPrompts.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">No prompts found. Add one!</p>
            ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Genre</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Prompt Text (Snippet)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {typedPrompts.map((prompt) => (
                                <tr key={prompt.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{prompt.genre}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate" title={prompt.prompt_text}>
                                        {prompt.prompt_text}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {prompt.is_active ? (
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <Link href={`/admin/prompts/${prompt.id}/edit`} className="text-indigo-600 hover:text-indigo-900 hover:underline">Edit</Link>
                                        {/* Ensure DeletePromptButton handles its own client-side logic */}
                                        <DeletePromptButton promptId={prompt.id} />
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