import {defineType, defineField, defineArrayMember} from 'sanity'

/**
 * Davis & Kwong LLP — website content.
 *
 * One singleton document holds every editable string on the site. Sections
 * mirror the page top to bottom so the Studio reads like the website.
 *
 * Convention: in headline fields, wrap a phrase in *asterisks* to render it
 * in the gold serif italic, e.g. "Meet the *partners*".
 */

const stat = defineType({
  name: 'stat',
  title: 'Statistic',
  type: 'object',
  fields: [
    defineField({name: 'value', title: 'Number', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'label', title: 'Label', type: 'string', validation: (r) => r.required()}),
  ],
  preview: {select: {title: 'value', subtitle: 'label'}},
})

const practiceArea = defineType({
  name: 'practiceArea',
  title: 'Practice area',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'A single emoji.',
    }),
    defineField({name: 'title', title: 'Title', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'body',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (r) => r.required().max(320),
      description: 'Two or three sentences. Cards sit side by side, so keep lengths similar.',
    }),
  ],
  preview: {select: {title: 'title', subtitle: 'body'}},
})

const partner = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'object',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'role',
      title: 'Title',
      type: 'string',
      initialValue: 'Partner & Co-Founder',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photograph',
      type: 'image',
      options: {hotspot: true},
      description:
        'Square or portrait headshot, at least 700px. Use the hotspot to set what stays in frame when cropped. Leave empty to fall back to initials.',
    }),
    defineField({
      name: 'paragraphs',
      title: 'Biography',
      type: 'array',
      of: [defineArrayMember({type: 'text', rows: 5})],
      validation: (r) => r.required().min(1),
      description:
        'One entry per paragraph. Two paragraphs of similar length keeps the two bios aligned.',
    }),
    defineField({
      name: 'tags',
      title: 'Focus areas',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      validation: (r) => r.max(4),
      description: 'Three is the design intent. Four will wrap to a second line.',
    }),
    defineField({
      name: 'email',
      title: 'Email address',
      type: 'string',
      validation: (r) => r.required().email(),
    }),
  ],
  preview: {select: {title: 'name', subtitle: 'role', media: 'photo'}},
})

const site = defineType({
  name: 'site',
  title: 'Website content',
  type: 'document',
  groups: [
    {name: 'chrome', title: 'Header & footer', default: true},
    {name: 'hero', title: 'Hero'},
    {name: 'about', title: 'About'},
    {name: 'practice', title: 'Practice areas'},
    {name: 'team', title: 'Attorneys'},
    {name: 'contact', title: 'Contact'},
    {name: 'intake', title: 'Intake form'},
  ],
  fields: [
    // ── Header & footer ──
    defineField({
      name: 'firmName', title: 'Firm name', type: 'string', group: 'chrome',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logoInitials', title: 'Logo initials', type: 'string', group: 'chrome',
      description: 'The small square mark in the header, e.g. "D&K".',
    }),
    defineField({
      name: 'pageTitle', title: 'Browser tab title', type: 'string', group: 'chrome',
      description: 'Also what search engines show as the page title.',
    }),
    defineField({
      name: 'footerCopyright', title: 'Footer copyright line', type: 'string', group: 'chrome',
    }),
    defineField({
      name: 'footerLocation', title: 'Footer location', type: 'string', group: 'chrome',
    }),
    defineField({
      name: 'footerDisclaimer', title: 'Footer disclaimer', type: 'text', rows: 3, group: 'chrome',
      description: 'Attorney advertising notice. Check any wording change with your bar rules.',
    }),

    // ── Hero ──
    defineField({
      name: 'hero', title: 'Hero', type: 'object', group: 'hero',
      options: {collapsible: false},
      fields: [
        defineField({name: 'eyebrow', title: 'Small line above the headline', type: 'string'}),
        defineField({
          name: 'headline', title: 'Headline', type: 'text', rows: 2,
          description: 'Wrap a phrase in *asterisks* for the gold italic. Line breaks are kept.',
        }),
        defineField({name: 'intro', title: 'Introduction', type: 'text', rows: 4}),
        defineField({name: 'listLabel', title: 'List heading', type: 'string'}),
        defineField({
          name: 'helpWith', title: 'What we can help with', type: 'array',
          of: [defineArrayMember({type: 'string'})],
          description: 'Short phrases. Six fits the card without scrolling.',
        }),
      ],
    }),

    // ── About ──
    defineField({
      name: 'about', title: 'About', type: 'object', group: 'about',
      options: {collapsible: false},
      fields: [
        defineField({name: 'eyebrow', title: 'Section label', type: 'string'}),
        defineField({
          name: 'title', title: 'Section heading', type: 'text', rows: 3,
          description: 'Wrap a phrase in *asterisks* for the gold italic.',
        }),
        defineField({
          name: 'paragraphs', title: 'Firm story', type: 'array',
          of: [defineArrayMember({type: 'text', rows: 6})],
          description: 'One entry per paragraph.',
        }),
        defineField({
          name: 'badges', title: 'Credential badges', type: 'array',
          of: [defineArrayMember({type: 'string'})],
          description: 'Short phrases, e.g. "Licensed in New York".',
        }),
        defineField({
          name: 'stats', title: 'Statistics', type: 'array',
          of: [defineArrayMember({type: 'stat'})],
          validation: (r) => r.length(4),
          description: 'Exactly four — they sit in a 2×2 grid.',
        }),
        defineField({
          name: 'quote', title: 'Pull quote', type: 'object',
          fields: [
            defineField({name: 'text', title: 'Quote', type: 'text', rows: 4}),
            defineField({name: 'attribution', title: 'Attribution', type: 'string'}),
          ],
        }),
      ],
    }),

    // ── Practice areas ──
    defineField({
      name: 'practice', title: 'Practice areas', type: 'object', group: 'practice',
      options: {collapsible: false},
      fields: [
        defineField({name: 'eyebrow', title: 'Section label', type: 'string'}),
        defineField({
          name: 'title', title: 'Section heading', type: 'text', rows: 2,
          description: 'Wrap a phrase in *asterisks* for the gold italic.',
        }),
        defineField({name: 'intro', title: 'Introduction', type: 'text', rows: 3}),
        defineField({
          name: 'areas', title: 'Areas', type: 'array',
          of: [defineArrayMember({type: 'practiceArea'})],
          validation: (r) => r.length(6),
          description:
            'Exactly six — the grid is three across, so any other number leaves a gap on desktop. Reorder by dragging.',
        }),
      ],
    }),

    // ── Attorneys ──
    defineField({
      name: 'team', title: 'Attorneys', type: 'object', group: 'team',
      options: {collapsible: false},
      fields: [
        defineField({name: 'eyebrow', title: 'Section label', type: 'string'}),
        defineField({
          name: 'title', title: 'Section heading', type: 'text', rows: 2,
          description: 'Wrap a phrase in *asterisks* for the gold italic.',
        }),
        defineField({
          name: 'partners', title: 'Partners', type: 'array',
          of: [defineArrayMember({type: 'partner'})],
          description: 'Two sit side by side. Drag to reorder.',
        }),
      ],
    }),

    // ── Intake call-to-action ──
    defineField({
      name: 'intakeCta', title: 'Intake call-to-action', type: 'object', group: 'intake',
      options: {collapsible: false},
      fields: [
        defineField({name: 'eyebrow', title: 'Section label', type: 'string'}),
        defineField({
          name: 'title', title: 'Heading', type: 'text', rows: 2,
          description: 'Wrap a phrase in *asterisks* for the gold italic.',
        }),
        defineField({name: 'body', title: 'Body copy', type: 'text', rows: 4}),
        defineField({name: 'buttonLabel', title: 'Button label', type: 'string'}),
      ],
    }),

    // ── Intake form ──
    defineField({
      name: 'intakeForm', title: 'Intake form', type: 'object', group: 'intake',
      options: {collapsible: false},
      description: 'Wording inside the form itself. Field labels are fixed — they map to spreadsheet columns.',
      fields: [
        defineField({name: 'eyebrow', title: 'Small line above the heading', type: 'string'}),
        defineField({name: 'heading', title: 'Form heading', type: 'string'}),
        defineField({
          name: 'stepLabels', title: 'Step names', type: 'array',
          of: [defineArrayMember({type: 'string'})],
          validation: (r) => r.max(3),
        }),
        defineField({
          name: 'consentText', title: 'Consent notice', type: 'text', rows: 4,
          description: 'The grey box above the checkboxes. Check wording against your bar rules.',
        }),
        defineField({
          name: 'success', title: 'Confirmation message', type: 'object',
          fields: [
            defineField({name: 'title', title: 'Heading', type: 'string'}),
            defineField({name: 'body', title: 'Message', type: 'text', rows: 3}),
          ],
        }),
      ],
    }),

    // ── Contact ──
    defineField({
      name: 'contact', title: 'Contact', type: 'object', group: 'contact',
      options: {collapsible: false},
      fields: [
        defineField({name: 'eyebrow', title: 'Section label', type: 'string'}),
        defineField({
          name: 'title', title: 'Section heading', type: 'text', rows: 2,
          description: 'Wrap a phrase in *asterisks* for the gold italic.',
        }),
        defineField({name: 'intro', title: 'Introduction', type: 'text', rows: 4}),
        defineField({
          name: 'emails', title: 'Email contacts', type: 'array',
          description:
            'One row per person. Two or three read well in the column; more starts to crowd the intake button below.',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({name: 'label', title: 'Name or label', type: 'string'}),
                defineField({
                  name: 'email', title: 'Email address', type: 'string',
                  validation: (r) => r.email(),
                }),
              ],
              preview: {select: {title: 'label', subtitle: 'email'}},
            }),
          ],
        }),
        defineField({name: 'locationLabel', title: 'Location label', type: 'string'}),
        defineField({name: 'location', title: 'Location', type: 'string'}),
        defineField({name: 'locationNote', title: 'Location note', type: 'string'}),
        defineField({name: 'ctaLabel', title: 'Intake button label', type: 'string'}),
      ],
    }),
  ],
  preview: {
    prepare: () => ({title: 'Website content'}),
  },
})

export const schemaTypes = [site, stat, practiceArea, partner]
