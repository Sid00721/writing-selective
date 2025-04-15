// src/app/admin/prompts/[id]/edit/page.tsx (WITH createClient FIX)
import { createClient } from '@/lib/supabase/server'; // Use the modified server client
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EditPromptForm from '@/components/EditPromptForm'; // Assumes this component exists

// Define type for prompts based on your table columns
interface Prompt {
    id: number; // Or string if UUID
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
    // --- Read Environment Variables ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // --- Check if variables exist ---
    if (!supabaseUrl || !supabaseKey) {
      console.error("Edit Prompt Page Error: Supabase URL or Anon Key missing!");
      return (
          <div className="container mx-auto p-6 text-center text-red-500">
              Server configuration error. Cannot edit prompt.
          </div>
      );
    }

    // --- Create Client by PASSING variables (without await) ---
    const supabase = createClient(supabaseUrl, supabaseKey);

    const promptId = params.id;

    // Assuming AdminLayout handles the overall admin check
    console.log(`Workspaceing prompt ID ${promptId} for editing...`);

    // Fetch the specific prompt data
    const { data: prompt, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', promptId)
        .single(); // Expect only one prompt

    // Handle case where prompt isn't found or fetch error occurs
    if (error || !prompt) {
        console.error(`Error fetching prompt with ID ${promptId}:`, error?.message ?? 'Prompt not found');
        return (
             <div className="p-4">
                 <p className="text-red-500 text-center">Prompt not found or error loading.</p>
                 <div className="text-center mt-4">
                    <Link href="/admin/prompts" className="text-blue-600 hover:underline mt-2 inline-block">
                        &larr; Back to Prompts List
                     </Link>
                 </div>
            </div>
        );
    }

    // Cast to defined type (optional but good practice)
    const typedPrompt = prompt as Prompt;
    console.log(`Prompt ${promptId} fetched successfully.`);

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