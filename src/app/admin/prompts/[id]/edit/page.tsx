// src/app/admin/prompts/[id]/edit/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EditPromptForm from '@/components/EditPromptForm'; // We will create this next

// Define type for prompts based on your table columns
// Make sure this matches the type used elsewhere
interface Prompt {
    id: number; // Or string
    created_at: string;
    genre: string;
    prompt_text: string;
    is_active: boolean;
}

// Define props including params
interface PageProps {
    params: { id: string }; // id from the URL
}

export default async function EditPromptPage({ params }: PageProps) {
    const supabase = await createClient();
    const promptId = params.id;

    // No need to re-check admin status, AdminLayout already handles it

    // Fetch the specific prompt data
    const { data: prompt, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single(); // Expect only one prompt

    // Handle case where prompt isn't found
    if (error || !prompt) {
        console.error(`Error fetching prompt with ID ${promptId}:`, error?.message);
        // Maybe redirect back to list or show a not found message
        return (
             <div className="p-4">
                <p className="text-red-500">Prompt not found or error loading.</p>
                <Link href="/admin/prompts" className="text-blue-600 hover:underline mt-2 inline-block">
                    &larr; Back to Prompts List
                 </Link>
            </div>
        );
    }

    // Cast to defined type
    const typedPrompt = prompt as Prompt;

    // Render the client component form, passing the fetched prompt data
    return (
         <div>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold">Edit Writing Prompt</h2>
                 <Link href="/admin/prompts" className="text-blue-600 hover:underline text-sm">
                     &larr; Back to Prompts List
                 </Link>
            </div>
             {/* Pass the fetched prompt data to the form component */}
            <EditPromptForm initialPrompt={typedPrompt} />
        </div>
    );
}