import { useConfigContext } from 'Context/ConfigContext';
import { BaseSlide, BaseSlideProps } from './BaseSlide';
export const ConfigureSlide = ({ goNext, ...props }: BaseSlideProps) => {
  const { setConfig } = useConfigContext();
  return <BaseSlide {...props} title="Lumen для Windows" subtitle="Управление мышью и клавиатурой. F11 — полный экран, Escape — выход. Данные хранятся рядом с приложением."
    goNext={() => { setConfig('isTV', false); setConfig('showRatings', true); setConfig('numberOfColumnsMobile', 6); setConfig('tabPosition', 'top'); setConfig('newHomeInterface', true); setConfig('recentTabsInterface', true); setConfig('themeScheme', 'dark'); goNext?.(); }} />;
};
