import FilmType from "Type/Film.type";

export default interface FilmApiInterface {
    getFilm(): Promise<FilmType>;
    getComments(): string;
}