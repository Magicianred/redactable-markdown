module.exports = function fromRedactedUrls() {
  if (this.Parser) {
    const Parser = this.Parser;
    const tokenizers = Parser.prototype.inlineTokenizers;
    const methods = Parser.prototype.inlineMethods;
    const REDACTED_LINK_RE = /^!?\[([^^\]]+)\]/;
    const REDACTED_TIPLINK_RE = /^\[([^^\]]+!!!)\]/;
    let linkCount = 0;

    const tokenizeRedactedLink = function (eat, value, silent) {
      const match = REDACTED_LINK_RE.exec(value);
      if (!match) {
        return;
      }

      if (value.charAt(match[0].length) === "[") {
        return;
      }

      if (silent) {
        return true;
      }

      const now = eat.now();

      if (REDACTED_TIPLINK_RE.exec(value)) {
        const node = this.tokenizeInline(match[1], now);
        node[0].children[0].type = "linkReference";
        node[0].children[0].identifier = `redactedUrlReference-${linkCount++}`;
        node[0].children[0].referenceType = "full";
        return eat(match[0])(node[0]);
      }

      const content = match[0] + `[redactedUrlReference-${linkCount++}]`;
      const node = this.tokenizeInline(content, now);
      return eat(match[0])(node[0]);
    }

    tokenizeRedactedLink.locator = function (value) {
      return value.search(REDACTED_LINK_RE);
    }

    /* Add an inline tokenizer (defined in the following example). */
    tokenizers.redactedLink = tokenizeRedactedLink;

    /* Run before default reference. */
    methods.splice(methods.indexOf('reference'), 0, 'redactedLink');
  }
}
