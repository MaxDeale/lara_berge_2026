'use client'

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schemaTypes, SERVER_WRITTEN, SINGLETONS } from './src/sanity/schemaTypes'
import { structure } from './src/sanity/structure'

const hiddenFromCreate = new Set<string>([...SERVER_WRITTEN, ...SINGLETONS])

export default defineConfig({
  name: 'lara-berge-artworks',
  title: 'Lara Berge Artworks',
  basePath: '/studio',
  projectId,
  dataset,
  plugins: [
    structureTool({ structure, title: 'Content' }),
    // The GROQ playground is for Max, not Lara
    ...(process.env.NODE_ENV === 'development'
      ? [visionTool({ defaultApiVersion: apiVersion })]
      : []),
  ],
  schema: {
    types: schemaTypes,
    // Orders, commission requests and Settings can't be created from the "+" menu
    templates: (templates) => templates.filter((t) => !hiddenFromCreate.has(t.schemaType)),
  },
  document: {
    newDocumentOptions: (prev) => prev.filter((item) => !hiddenFromCreate.has(item.templateId)),
    actions: (prev, { schemaType }) => {
      if ((SINGLETONS as readonly string[]).includes(schemaType)) {
        return prev.filter(
          ({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action),
        )
      }
      if ((SERVER_WRITTEN as readonly string[]).includes(schemaType)) {
        // Lara can update status and notes, but never duplicate or delete an order
        return prev.filter(
          ({ action }) => action && ['publish', 'discardChanges', 'restore'].includes(action),
        )
      }
      return prev
    },
  },
})
