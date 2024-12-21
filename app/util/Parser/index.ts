import { parse, HTMLElement } from 'node-html-parser';

export interface HTMLElementInterface extends HTMLElement {
  querySelector(selector: string): HTMLElementInterface | null;
  querySelectorAll(selector: string): HTMLElementInterface[];
}

export const parseHtml = (str: string): HTMLElementInterface => {
  return parse(str, {
    lowerCaseTagName: false, // convert tag name to lower case (hurts performance heavily)
    comment: false, // retrieve comments (hurts performance slightly)
    fixNestedATags: false, // fix invalid nested <a> HTML tags
    parseNoneClosedTags: false, // close none closed HTML tags instead of removing them
    blockTextElements: {
      script: true, // keep text content when parsing
      noscript: true, // keep text content when parsing
      style: true, // keep text content when parsing
      pre: true, // keep text content when parsing
    },
  });
};
