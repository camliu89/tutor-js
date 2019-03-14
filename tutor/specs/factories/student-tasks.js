const {
  Factory, sequence, fake, moment, SECTION_NAMES,
} = require('./helpers');
const { capitalize, range } = require('lodash');

const TASK_TYPES={
  reading: [
    'reading',
    'exercise',
  ],
  homework: [
    'exercise',
  ],
}

Factory.define('StudentTaskStep')
  .id(sequence)
  .type(fake.random.arrayElement(['reading', 'homework']))
  .is_completed(fake.random.arrayElement(false, false, false, true))
  .preview(({ object: { type } }) => type == 'homework' ?
    fake.company.bsAdjective() + ': ' + fake.random.arrayElement(SECTION_NAMES) :
    fake.random.arrayElement(SECTION_NAMES)
  )

Factory.define('StudentTask')
  .id(sequence)
  .title(fake.company.catchPhraseDescriptor)
  .type(fake.random.arrayElement(Object.keys(TASK_TYPES)))
  .due_at(({ now, days_ago = 0 }) => moment(now).add(days_ago + 3, 'days'))
  .steps(({ stepCount, object: { type } }) =>
    range(0, stepCount || fake.random.number({ min: 3, max: 10 })).map(() => {
      return Factory.create('StudentTaskStep', {
        type: fake.random.arrayElement(TASK_TYPES[type]),
      })
    }),
  )

Factory.define('StudentTaskReadingStepContent')
  .id(sequence)
  .type('reading')
  .chapter_section([1,2])
  .related_content(({ object }) => [
    { title: fake.random.arrayElement(SECTION_NAMES),
      chapter_section: object.chapter_section }
  ])
  .has_learning_objectives(() => fake.random.arrayElement([ false, false, false, true ]))
  .title(fake.random.arrayElement(SECTION_NAMES))
  .content_html(
    '<span class="os-text">Physics: An Introduction</span> </h2> <div class="os-figure"> <figure id="import-auto-id1580373"><span data-alt="Two Canada geese flying close to each other in the sky." data-type="media" id="import-auto-id1936836"><img alt="Two Canada geese flying close to each other in the sky." data-media-type="image/wmf" id="90580" src="https://cnx.org/resources/18f7913be5bf22af357a34143dd8638511b9ba9a" width="325"></span> </figure><div class="os-caption-container"> <span class="os-title-label">Figure </span><span class="os-number">1.2</span><span class="os-divider"s as food calories, batteries, heat, light, and watch springs. Understanding this law makes it easier to learn about the various forms energy takes and how they relate to one another. Apparently unrelated topics are connected through broadly applicable physical laws, permitting an understanding beyond just the memorization of lists of facts.</p> <p id="import-auto-id2555094">The unifying aspect of physical laws and the basic simplicity'
    )
