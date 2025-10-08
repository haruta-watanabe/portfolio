import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
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
    type: 'content',
    schema: z.object({
        title: z.string(),
    }),
});

export const collections = {
    'projects': projectsCollection,
    'blog': blogCollection,
    'legal': legalCollection,
};