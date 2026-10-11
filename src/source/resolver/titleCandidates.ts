import { FilmType } from 'Type/FilmType.type';
import { decode } from 'html-entities';

const normalize = (title: string) => decode(title).normalize('NFKC').toLowerCase()
  .replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();

type Candidate = { title: string; originalTitle?: string; year?: number; type: FilmType };
// This only selects candidates for detail verification. It never establishes identity.
export const isTitleVariantCandidate = (first: Candidate, second: Candidate): boolean => {
  if (!first.year || first.year !== second.year || first.type !== second.type) return false;
  if (first.originalTitle && second.originalTitle && normalize(first.originalTitle) === normalize(second.originalTitle)) return true;
  if (normalize(first.title) === normalize(second.title)) return true;
  const firstBase = normalize(first.title.split(':')[0]);
  const secondBase = normalize(second.title.split(':')[0]);
  return (first.title.includes(':') || second.title.includes(':')) && firstBase.length >= 4 && firstBase === secondBase;
};
