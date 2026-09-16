import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemas'

/**
 * There is only ever one "Website content" document, so the Studio opens
 * straight into it — no document list, no way to create a second copy.
 */
export default defineConfig({
  name: 'default',
  title: 'Davis & Kwong LLP',

  projectId: 'a11lv153',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Website content')
              .id('site')
              .child(S.document().schemaType('site').documentId('site')),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
    // Hide the singleton from the global "create new" menu.
    templates: (prev) => prev.filter((t) => t.schemaType !== 'site'),
  },

  document: {
    actions: (prev, {schemaType}) =>
      schemaType === 'site'
        ? prev.filter(({action}) => ['publish', 'discardChanges', 'restore'].includes(action))
        : prev,
  },
})
