import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectsCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
    schema: ({ image }) => z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string().transform((str) => new Date(str)),
        tags: z.array(z.string()),
        img: image(),
        img_alt: z.string().optional(),
    }),
});

const blogCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
    schema: ({ image }) => z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.string().transform((str) => new Date(str)),
        tags: z.array(z.string()),
        img: image(),
        img_alt: z.string().optional(),
    }),
});

const legalCollection = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/legal' }),
    schema: z.object({
        title: z.string(),
    }),
});

export const collections = {
    projects: projectsCollection,
    blog: blogCollection,
    legal: legalCollection,
};
