var HTMLParser = require('fast-html-parser');

export interface HTMLElementInterface {
  querySelector(selector: string): HTMLElementInterface | null;
  querySelectorAll(selector: string): HTMLElementInterface[];
  attributes: { [key: string]: string };
  rawText: string;
}

export const parseHtml = (str: string): HTMLElementInterface => {
  return HTMLParser.parse(str, {
    lowerCaseTagName: false, // convert tag name to lower case (hurt performance heavily)
    script: false, // retrieve content in <script> (hurt performance slightly)
    style: false, // retrieve content in <style> (hurt performance slightly)
    pre: false, // retrieve content in <pre> (hurt performance slightly)
  });
};
