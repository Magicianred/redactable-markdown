const expect = require('expect');
const parser = require('../../../../src/redactableMarkdownParser').create();
const mapMdast = require('../../../utils').mapMdast;

describe('vocablink', () => {
  describe('parse', () => {
    it('can distinguish between vocablinks with word overrides and linkReferences', () => {
      // the only difference between these two bits of the syntax is the "v "
      const vocablink = parser.getParser().parse("[v some-word][override]");
      const linkReference = parser.getParser().parse("[some-word][override]");
      expect(mapMdast(vocablink)).toEqual({
        children: [{ children: [{ type: 'rawtext' }], type: 'paragraph' }],
        type: 'root',
      });
      expect(mapMdast(linkReference)).toEqual({
        children: [
          {
            children: [{ children: [{ type: 'text' }], type: 'linkReference' }],
            type: 'paragraph',
          },
        ],
        type: 'root',
      });
    });
  });

  describe('render', () => {
    it('can only render vocablinks back out to plain text', () => {
      const input = "[v some-word]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>[v some-word]</p>\n");
    });

    it('can only render vocablinks with word overrides back out to plain text', () => {
      const input = "[v some-word][override]";
      const output = parser.sourceToHtml(input);
      expect(output).toEqual("<p>[v some-word][override]</p>\n");
    });
  });

  describe('redact', () => {
    it('redacts vocablinks', () => {
      const input = "[v some-word]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[some-word][0]\n");
    });

    it('redacts vocablinks with word overrides', () => {
      const input = "[v some-word][un-mot]";
      const output = parser.sourceToRedacted(input);
      expect(output).toEqual("[un-mot][0]\n");
    });
  });

  describe('restore', () => {
    it('can restore vocablinks back to markdown', () => {
      const source = "[v some-word]";
      const redacted = "[un-mot][0]"
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      expect(output).toEqual("[v some-word][un-mot]\n");
    });

    it('can restore vocablinks with word overrides back to markdown', () => {
      const source = "[v some-word][source-override]";
      const redacted = "[redaction-override][0]"
      const output = parser.sourceAndRedactedToMarkdown(source, redacted);
      expect(output).toEqual("[v some-word][redaction-override]\n");
    });
  });
});
