import sanitizeHtml from "sanitize-html";
import Showdown from "showdown";

export function markdownToHtml(markdown: string): string {
  const converter = new Showdown.Converter();
  const newHtml = converter.makeHtml(markdown);

  const s = sanitizeHtml(newHtml, {
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: {
          ...attribs,
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
    },
  });

  return s;
}
