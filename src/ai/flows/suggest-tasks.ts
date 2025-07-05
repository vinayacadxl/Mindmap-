'use server';

/**
 * @fileOverview A flow that suggests new tasks based on a high-level goal.
 *
 * - suggestTasks - A function that handles the task suggestion process.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The return type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksInputSchema = z.object({
  prompt: z.string().describe('A high-level prompt describing the project or goal.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  tasks: z
    .array(
      z.object({
        title: z.string().describe('The title of the task.'),
        description: z.string().describe('A brief description of the task.'),
      })
    )
    .describe('An array of suggested tasks.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are a project planning assistant. Based on the following high-level goal, break it down into a list of actionable tasks.

Goal: {{{prompt}}}

For each task, provide a concise title and a brief description. Return the tasks as a JSON array of objects, where each object has "title" and "description" fields.
`,
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
