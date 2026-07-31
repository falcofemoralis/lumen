import { AccordionGroupInterface } from 'Component/ThemedAccordion/ThemedAccordion.type';
import { FilmInterface } from 'Type/Film.interface';
import { InfoListInterface } from 'Type/InfoList.interface';

export interface FilmViewInfoListOverlayContainerProps {
  film: FilmInterface;
  handleSelectCategory: (categoryLink: string) => void;
}

export type FilmViewInfoListOverlayComponentProps = {
  data: AccordionGroupInterface<InfoListInterface>[]
  handleSelectCategory: (categoryLink: string) => void;
}
