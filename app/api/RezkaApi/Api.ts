import ApiInterface from "Api/interface/Api.interface";
import FilmServiceInterface from "Api/interface/FilmApi.interface";
import FilmApi from "./FilmApi";

class RezkaApi implements ApiInterface {
    getFilmApi(): FilmServiceInterface {
        return FilmApi;
    }
}

export default new RezkaApi();