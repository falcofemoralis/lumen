import { ApiParams, FilmApiInterface } from 'Api/index';
import { BookmarkInterface } from 'Type/Bookmark.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { FilmType } from 'Type/FilmType.type';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { InfoListInterface } from 'Type/InfoList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { RatingInterface } from 'Type/Rating.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { decodeHtml } from 'Util/Htlm';
import { HTMLElementInterface } from 'Util/Parser';
import { Variables } from 'Util/Request';

import configApi from './configApi';
import {
  parseActorCard,
  parseFilmCard, parseFilmsListRoot, parseSeasons, parseStreams,
} from './utils';

const filmApi: FilmApiInterface = {
  /**
   * Get films list by params
   * @param page
   * @param path
   * @returns FilmList
   */
  async getFilms(
    page: number,
    path = '',
    variables?: Variables,
    params?: ApiParams,
  ): Promise<FilmListInterface> {
    const { key } = params || {};

    const root = await configApi.fetchPage(
      `${path === '/' ? '' : path}/page/${page}/`,
      variables,
    );

    const content = key ? root.querySelector(key) : root;

    if (!content) {
      return {
        films: [],
        totalPages: 1,
      };
    }

    return parseFilmsListRoot(content);
  },

  /**
   * Get film by link
   * @param link
   * @returns Film
   */
  async getFilm(link: string): Promise<FilmInterface | null> {
    const root = await configApi.fetchPage(link);

    // base data
    const id = root.querySelector('#user-favorites-holder')?.attributes['data-post_id'] ?? '';
    const title = root.querySelector('.b-post__title h1')?.rawText ?? '';
    const poster = root.querySelector('.b-sidecover img')?.attributes.src ?? '';
    const largePoster = root.querySelector('.b-sidecover a')?.attributes.href ?? '';

    const film: FilmInterface = {
      id,
      link,
      type: FilmType.FILM,
      title,
      poster,
      voices: [],
      hasVoices: false,
      hasSeasons: false,
      largePoster,
    };

    film.originalTitle = root.querySelector('.b-post__origtitle')?.rawText;

    const infoTable = root.querySelectorAll('.b-post__info tr');
    infoTable.forEach((el) => {
      el.childNodes = el.childNodes.filter((node) => node.rawTagName === 'td');
      const key = el.firstChild?.rawText.replace(':', '');
      const value = el.lastChild as HTMLElementInterface|undefined;

      if (key && value) {
        switch (key) {
          case 'Рейтинги':
            film.ratingScale = 10;
            film.ratings = value.childNodes.filter((node) => node.rawTagName === 'span').map((node) => (
              {
                text: node.rawText,
                name: node.childNodes[0]?.rawText,
                rating: Number(node.childNodes[2]?.rawText),
                votes: Number(node.childNodes[4]?.rawText.replace('(', '').replace(')', '').replaceAll(' ', '')),
              } as RatingInterface
            ));
            break;
          case 'Входит в списки':
            film.includedIn = value.childNodes.reduce((acc: InfoListInterface[], node, idx) => {
              if (node.rawTagName === 'a') {
                acc.push({
                  name: node.rawText,
                  position: String(value.childNodes[idx + 1]?.rawText),
                  link: (node as HTMLElementInterface).attributes.href,
                });
              }

              return acc;
            }, []);
            break;
          case 'Дата выхода':
            film.releaseDate = value.rawText;
            break;
          case 'Страна':
            film.countries = value.childNodes
              .filter((node) => node.rawTagName === 'a')
              .map((node) => node.rawText);
            break;
          case 'Режиссер':
            film.directors = value
              .querySelectorAll('.person-name-item')
              .map((node) => parseActorCard(node, true));
            break;
          case 'Жанр':
            film.genres = value.childNodes
              .filter((node) => node.rawTagName === 'a')
              .map((node) => node.rawText);
            break;
          case 'В качестве':
            break;
          case 'В переводе':
            break;
          case 'Возраст':
            // film.age = value.rawText;
            break;
          case 'Время':
            film.duration = value.rawText;
            break;
          case 'Из серии':
            film.fromCollections = value.childNodes
              .filter((node) => node.rawTagName === 'a')
              .map((node) => ({
                name: node.rawText,
                link: (node as HTMLElementInterface).attributes.href,
              }));
            break;
          default:
            if (key.includes('В ролях актеры')) {
              film.actors = el.querySelectorAll('.person-name-item').map(
                (node) => parseActorCard(node),
              );
              break;
            }

            break;
        }
      }
    });

    const rating = root.querySelector('.b-post__rating');
    if (rating) {
      const num = rating.querySelector('.num')?.rawText;
      const votes = rating.querySelector('.votes')?.rawText.replace('(', '').replace(')', '').replaceAll(' ', '');

      film.mainRating = {
        text: `${num} (${votes})`,
        name: 'Rezka',
        rating: Number(num),
        votes: Number(votes),
      };
    }

    film.description = root.querySelector('.b-post__description_text')?.rawText.trim();
    film.isPendingRelease = !!root.querySelector('.b-post__go_status');

    if (!film.isPendingRelease) {
      // player data
      root.querySelectorAll('.b-translator__item').forEach((el) => {
        const voice: FilmVoiceInterface = {
          id: el.attributes['data-translator_id'],
          identifier: '',
          title: el.attributes.title,
          img: el.querySelector('img')?.attributes.src,
          isCamrip: el.attributes['data-camrip'],
          isDirector: el.attributes['data-director'],
          isAds: el.attributes['data-ad'],
          isActive: el.attributes.class.includes('active'),
          isPremium: el.attributes.class.includes('b-prem_translator'),
        };

        if (voice.isPremium) {
          voice.premiumIcon = `${configApi.getProvider()}/templates/hdrezka/images/prem-icon.svg`;
        }

        film.voices.push({
          ...voice,
          ...(voice.isActive ? parseSeasons(root) : {}),
        });
      });

      const { voices } = film;

      if (!voices.length) {
        const isMovie = root.querySelector('meta[property=og:type]')?.attributes.content?.includes('video.movie');
        const stringedDoc = root.innerHTML;

        if (isMovie) {
          const index = stringedDoc.indexOf('initCDNMoviesEvents');
          const subString = stringedDoc.substring(
            stringedDoc.indexOf('{"id"', index),
            stringedDoc.indexOf('});', index) + 1,
          );
          const jsonObject = JSON.parse(subString);
          const streams = parseStreams(jsonObject.streams);
          // subtitles = parseSubtitles(jsonObject.subtitle);
          // getThumbnails(jsonObject.thumbnails, trans);

          const video: FilmVideoInterface = {
            streams,
          };

          film.voices.push({
            id: '',
            identifier: '',
            title: '',
            isCamrip: '0',
            isDirector: '0',
            isAds: '0',
            isActive: true,
            isPremium: false,
            video,
          });
        } else {
          const startIndex = stringedDoc.indexOf('initCDNSeriesEvents');
          let endIndex = stringedDoc.indexOf('{"id"', startIndex);
          if (endIndex === -1) {
            endIndex = stringedDoc.indexOf('{"url"', startIndex);
          }
          const subString = stringedDoc.substring(startIndex, endIndex);

          film.voices.push({
            id: subString.split(',')[1].replaceAll(' ', ''),
            identifier: '',
            title: '',
            isCamrip: '0',
            isDirector: '0',
            isAds: '0',
            isActive: true,
            isPremium: false,
            ...parseSeasons(root),
          });
        }
      }

      const { seasons = [] } = voices.find(({ isActive }) => isActive) ?? {};
      film.hasSeasons = seasons.length > 0;
      film.hasVoices = film.voices.length > 1;
      film.voices = film.voices.map((voice) => {
        const {
          id: vID,
          isDirector,
          isCamrip,
          isPremium,
          isAds,
        } = voice;

        return {
          ...voice,
          identifier: `${vID}-${isDirector}-${isCamrip}-${isPremium}-${isAds}`,
        };
      });
    }

    // additional info

    film.schedule = root.querySelectorAll('.b-post__schedule_block').map((table) => {
      const scheduleName = table.querySelector('.b-post__schedule_block_title .title')?.rawText ?? '';
      const scheduleItems: ScheduleItemInterface[] = table.querySelectorAll('tr')
        .filter((row) => {
          const tds = row.querySelectorAll('td');

          return tds.length > 2;
        })
        .map((row) => {
          const tds = row.querySelectorAll('td');
          const tableName = tds[0]?.rawText;
          const episodeName = decodeHtml(tds[1]?.querySelector('b')?.rawText ?? '');
          const episodeNameOriginal = decodeHtml(tds[1]?.querySelector('span')?.rawText);
          const isWatched = tds[2]?.querySelector('i')?.attributes.class.includes('watched');
          const date = tds[3]?.rawText;
          const exists = tds[4]?.rawText ?? '';
          const isReleased = exists.includes('check');

          return {
            name: tableName,
            episodeName,
            episodeNameOriginal,
            date,
            releaseDate: exists,
            isWatched,
            isReleased,
          };
        });

      const scheduleHardcodedHeader = `${film.title} - даты выхода серий `;

      const correctedName = scheduleName.includes(scheduleHardcodedHeader)
        ? scheduleName
          .replace(scheduleHardcodedHeader, '')
          .slice(0, -1)
        : scheduleName;

      return {
        name: correctedName,
        items: scheduleItems,
      };
    });

    film.franchise = root.querySelectorAll('.b-post__partcontent_item').map((el) => {
      const partItem = el.querySelector('.title')?.rawText ?? '';
      const partYear = el.querySelector('.year')?.rawText ?? '';
      const partRating = el.querySelector('.rating')?.rawText ?? '';
      const partLink = el.attributes['data-url'];

      return {
        name: partItem,
        year: partYear,
        rating: partRating,
        link: partLink,
      };
    });

    film.related = root.querySelectorAll('.b-sidelist .b-content__inline_item').map(
      (el) => parseFilmCard(el),
    );

    return film;
  },

  /**
   * Get films from home menu
   * @param menuItem
   * @param page
   * @param params
   * @returns FilmList
   */
  async getHomeMenuFilms(menuItem: MenuItemInterface, page: number, params?: ApiParams) {
    const { path, key, variables } = menuItem;

    if (key === '.b-newest_slider__wrapper') {
      const films: FilmCardInterface[] = [];

      const res = await configApi.postRequest(path, variables);
      const root = configApi.parseContent(`<div>${res}</div>`);
      const filmElements = root.querySelectorAll('.b-content__inline_item');

      filmElements.forEach((el) => {
        const film = parseFilmCard(el);

        if (film) {
          films.push(film);
        }
      });

      return {
        films,
        totalPages: 1,
      };
    }

    const filmsList = await this.getFilms(page, path, variables, {
      ...params,
      key,
    });

    return filmsList;
  },

  /**
   * Get films from bookmark
   * @param bookmark
   * @param page
   * @returns
   */
  async getBookmarkedFilms(bookmark: BookmarkInterface, page: number) {
    const { id } = bookmark;

    const filmsList = await this.getFilms(page, `/favorites/${id}`);

    return filmsList;
  },
};

export default filmApi;
