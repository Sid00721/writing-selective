// src/app/admin/prompts/page.tsx



import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import DeletePromptButton from '@/components/DeletePromptButton'; // We will create this next
import { redirect } from 'next/navigation'; // Import redirect


// Define type for prompts based on your table columns
interface Prompt {
    id: number; // Or string
    created_at: string;
    genre: string;
    prompt_text: string;
    is_active: boolean;
}




export default async function ManagePromptsPage() {
    const supabase = await createClient();

    // Fetch all prompts (Admins have SELECT permission via RLS)
    const { data: prompts, error } = await supabase
        .from('prompts')
        .select('*')
        .order('genre', { ascending: true }) // Order by genre first
        .order('created_at', { ascending: false }); // Then by creation date

    if (error) {
        console.error("Error fetching prompts:", error.message);
        // Render an error message
        return <div className="text-red-500 p-4">Error loading prompts. Please try again.</div>;
    }

    const typedPrompts = prompts as Prompt[] || []; // Type cast or default to empty array

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manage Writing Prompts</h2>
                {/* Link to add a new prompt (page to be created later) */}
                <Link href="/admin/prompts/new" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm">
                    + Add New Prompt
                </Link>
            </div>

            {/* Conditional rendering for table or "No prompts" message */}
        {typedPrompts.length === 0 ? (
            <p className="text-gray-500 italic">No prompts found.</p>
        ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm"> {/* Added container with border/shadow */}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50"> {/* Slightly darker header */}
                        <tr>
                            {/* Added more padding and text styling to headers */}
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Genre</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Prompt Text (Snippet)</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th> {/* Right-align actions */}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {typedPrompts.map((prompt) => (
                            <tr key={prompt.id} className="hover:bg-gray-50 transition-colors duration-150"> {/* Added hover effect */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{prompt.genre}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate"> {/* Allow slightly more width */}
                                    {prompt.prompt_text} {/* Removed explicit truncation logic, rely on CSS */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {/* Slightly adjusted badge padding/size */}
                                    {prompt.is_active ? (
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3"> {/* Right-align actions, add spacing */}
                                    <Link href={`/admin/prompts/${prompt.id}/edit`} className="text-indigo-600 hover:text-indigo-900 hover:underline">Edit</Link>
                                    {/* Ensure DeletePromptButton is imported and used correctly */}
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

