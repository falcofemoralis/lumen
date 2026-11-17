declare module 'node-webvtt' {
  interface Cue {
    start: number;
    end: number;
    text: string;
  }

  interface ParseResult {
    cues: Cue[];
    valid: boolean;
  }

  interface WebVtt {
    parse(input: string): ParseResult;
  }

  const webvtt: WebVtt;

  export default webvtt;
}