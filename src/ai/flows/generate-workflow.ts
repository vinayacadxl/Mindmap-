'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import OpenAI from 'openai';

const GenerateWorkflowInputSchema = z.object({
    prompt: z.string().describe('A project goal or description.'),
});

const GenerateWorkflowOutputSchema = z.object({
    tasks: z.array(z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        position: z.object({
            x: z.number(),
            y: z.number(),
        }),
    })),
    edges: z.array(z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        label: z.string().optional(),
    })),
});

export type GenerateWorkflowOutput = z.infer<typeof GenerateWorkflowOutputSchema>;

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    defaultHeaders: {
        'HTTP-Referer': 'https://mindtask-navigator.vercel.app', // Example
        'X-OpenRouter-Title': 'MindTask Navigator',
    },
});

export async function generateWorkflow(input: { prompt: string }): Promise<GenerateWorkflowOutput> {
    const response = await openai.chat.completions.create({
        model: 'google/gemini-2.0-flash-001', // Or any other model
        messages: [
            {
                role: 'system',
                content: `You are a project planning assistant. Generate a structured workflow as a JSON object.
        Include "tasks" (with id, title, description, and position {x, y}) and "edges" (with id, source, target, label).
        Positions should be laid out logically (e.g., left-to-right, starting around 100,100).
        Space tasks out by at least 300 units horizontally.
        The output must be pure JSON.`,
            },
            {
                role: 'user',
                content: input.prompt,
            },
        ],
        response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No content from AI');

    // Strip markdown code fences if the model wraps the JSON in ```json ... ```
    const cleaned = content
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

    let parsed: any;
    try {
        parsed = JSON.parse(cleaned);
    } catch (e) {
        throw new Error('AI returned invalid JSON: ' + cleaned.slice(0, 200));
    }

    // Guarantee the shape is correct even if the model skips a field
    return {
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    } as GenerateWorkflowOutput;
}

// We can still wrap it in a Genkit flow for observability if needed
export const generateWorkflowFlow = ai.defineFlow(
    {
        name: 'generateWorkflow',
        inputSchema: GenerateWorkflowInputSchema,
        outputSchema: GenerateWorkflowOutputSchema,
    },
    async (input) => {
        return generateWorkflow(input);
    }
);
