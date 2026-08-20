/**
 * The BBCode the composer wraps a selection in -- see `COMMENT_TAGS` in
 * Component/Comments/Comments.config. A posted comment is stored raw, tags and
 * all, so anything reading it back has to resolve them itself.
 */
const TAG_PATTERN = /\[(\/?)(b|i|u|s|spoiler)\]/gi;

export interface CommentSegmentInterface {
  text: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isCrossed: boolean;
}

type SegmentStyle = Omit<CommentSegmentInterface, 'text'>;

/**
 * `spoiler` deliberately carries no style: a list of one's own comments has
 * nothing to give away, so the tag is dropped and its text left in the open.
 */
const styleForTags = (openTags: string[]): SegmentStyle => ({
  isBold: openTags.includes('b'),
  isItalic: openTags.includes('i'),
  isUnderline: openTags.includes('u'),
  isCrossed: openTags.includes('s'),
});

const isSameStyle = (a: SegmentStyle, b: SegmentStyle) => a.isBold === b.isBold
  && a.isItalic === b.isItalic
  && a.isUnderline === b.isUnderline
  && a.isCrossed === b.isCrossed;

/**
 * Splits a raw comment body into runs of text sharing one set of tags. Tags
 * nest, so a run carries every style open over it rather than a single type.
 * A closing tag with nothing to close, and an opening tag never closed, are
 * both taken at face value: the markers go, the text stays.
 */
export const parseCommentTags = (raw: string): CommentSegmentInterface[] => {
  const segments: CommentSegmentInterface[] = [];
  const openTags: string[] = [];
  let lastIndex = 0;

  const pushText = (text: string) => {
    if (!text) {
      return;
    }

    const style = styleForTags(openTags);
    const previous = segments[segments.length - 1];

    // `[b]a[/b][b]b[/b]` is one run as far as the renderer is concerned
    if (previous && isSameStyle(previous, style)) {
      previous.text += text;

      return;
    }

    segments.push({ text, ...style });
  };

  for (const match of raw.matchAll(TAG_PATTERN)) {
    const index = match.index ?? 0;
    const [marker, closing, tag] = match;
    const name = tag.toLowerCase();

    pushText(raw.slice(lastIndex, index));
    lastIndex = index + marker.length;

    if (!closing) {
      openTags.push(name);

      continue;
    }

    // innermost first, so `[b][b]x[/b]y[/b]` keeps `y` bold
    const openedAt = openTags.lastIndexOf(name);

    if (openedAt !== -1) {
      openTags.splice(openedAt, 1);
    }
  }

  pushText(raw.slice(lastIndex));

  return segments;
};
