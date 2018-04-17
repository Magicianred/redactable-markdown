const expect = require('expect');
const parser = require('../../src/cdoFlavoredParser');
const mapMdast = require('../utils').mapMdast;

// Of the top twenty words in the initial curriculumbuilder data set, take out
// all those like "r" that represent control characters and all the things like
// "csf" that don't actually have translations, and put together a super-basic
// english-to-french translation scheme for them.
const EN_FR = {
  'to': 'à',
  'the': 'la',
  'a': 'une',
  'of': 'de',
  'students': 'élèves',
  'and': 'et',
  'in': 'dans',
  'will': 'volonté',
  'this': 'ce',
  'for': 'pour',
  'lesson': 'leçon',
  'that': 'cette',
  'loops': 'boucles',
  'is': 'est',
  'be': 'être',
  'with': 'avec',
  'debugging': 'débogage',
  'class': 'classe',
  'your': 'votre',
  'programming': 'la programmation',
  'on': 'sur',
  'their': 'leur',
  'an': 'un',
  'as': 'comme',
  'each': 'chaque',
  'student': 'étudiant',
  'we': 'nous',
  'have': 'avoir',
  'how': 'comment',
  'group': 'groupe',
  'they': 'ils',
  'are': 'sont',
  'make': 'faire',
  'or': 'ou',
  'using': 'en utilisant',
  'think': 'pense',
  'out': 'en dehors'
}

function translate(string) {
  Object.keys(EN_FR).forEach(en => {
    string = string.replace(new RegExp(`\\b${en}\\b`, 'g'), EN_FR[en]);
  });
  return string;
}

describe("Curriculum Builder content", () => {
  ["Lesson", "Curriculum", "Unit"].forEach(contentType => {
    describe(contentType, () => {
      const data = require(`./${contentType.toLowerCase()}.json`);
      Object.keys(data).forEach(contentName => {
        describe(contentName, () => {
          const content = data[contentName];
          Object.keys(content).forEach(contentProperty => {
            // titles, although included in the data set I'm looking at, are not
            // markdown and should not be treated as such
            if (contentProperty === "title") {
              return
            }

            it(contentProperty, () => {
              // prop is markdown content
              const prop = content[contentProperty];

              // redacted is translated and redacted markdown content
              const redacted = translate(parser.sourceToRedacted(prop));

              // restored is the result of restoring the original markdown content
              // with the translations
              const restored = parser.sourceAndRedactedToMarkdown(prop, redacted);

              // no matter the changes made to redaction, the restoration should
              // still produce the same HTML structure (but not necessarily the
              // same text content) as the original markdown content
              const original = parser.getParser().parse(prop);
              const result = parser.getParser().parse(restored);
              expect(mapMdast(result)).toEqual(mapMdast(original));
            });
          });
        });
      });
    });
  });
});
