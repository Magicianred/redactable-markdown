const expect = require('expect');
const parser = require('../../../src/cdoFlavoredParser');

describe('tip', () => {
  describe('render', () => {
    it('renders a basic tip', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToHtml(input);
      /**
       * <div class="admonition tip">
       *   <p class="admonition-title" id="tip_tip-0">
       *     <i class="fa fa-lightbulb-o"></i>
       *     this is an optional title, and it should be translatable
       *   </p>
       *   <div>
       *     <p>
       *       This is the content of the tip, and it should be translatable This is more stuff that is still part of the content of the tip
       *     </p>
       *   </div>
       * </div>
       * <p>This is the next paragraph</p>
       */
      const expected = "<div class=\"admonition tip\"><p class=\"admonition-title\" id=\"tip_tip-0\"><i class=\"fa fa-lightbulb-o\"></i>this is an optional title, and it should be translatable</p><div><p>This is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div></div>\n<p>This is the next paragraph</p>\n"
      expect(output).toEqual(expected);
    });
  });

  describe('redact', () => {
    it('can redact a basic tip', () => {
      const input = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const output = parser.sourceToRedacted(input);
      /**
       * [this is an optional title, and it should be translatable][0]
       * 
       * This is the content of the tip, and it should be translatable
       * This is more stuff that is still part of the content of the tip
       * 
       * [/][0]
       * 
       * This is the next paragraph
       */
      expect(output).toEqual("[this is an optional title, and it should be translatable][0]\n\nThis is the content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n");
    });
  });

  describe('restore', () => {
    it('can restore a basic tip', () => {
      const source = "!!!tip \"this is an optional title, and it should be translatable\" <tip-0>\n    This is the content of the tip, and it should be translatable\n    This is more stuff that is still part of the content of the tip\n\nThis is the next paragraph";
      const redacted = "[c'est une optional title, and it should be translatable][0]\n\nC'est du content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip\n\n[/][0]\n\nThis is the next paragraph\n";
      const output = parser.sourceAndRedactedToHtml(source, redacted);
      const expected = "<div class=\"admonition tip\"><p class=\"admonition-title\" id=\"tip_tip-0\"><i class=\"fa fa-lightbulb-o\"></i>c'est une optional title, and it should be translatable</p><div><p>C'est du content of the tip, and it should be translatable\nThis is more stuff that is still part of the content of the tip</p></div></div>\n<p>This is the next paragraph</p>\n"
      expect(output).toEqual(expected);
    });
  });
});
