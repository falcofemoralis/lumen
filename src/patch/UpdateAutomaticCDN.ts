import { ApiServiceType } from 'Api/index';
import { services } from 'Api/services';
import { PatchInterface } from 'Util/Patch';

export const UpdateAutomaticCDN: PatchInterface = {
  name: 'UpdateAutomaticCDN',

  apply: () => {
    const service = services[ApiServiceType.REZKA];
    const config = service.getConfig();

    if (config.cdn === 'auto') {
      service.setAutomaticCDN(true);
      service.setCDN(service.defaultCDNs[0]);
    } else if (config.cdn !== '') {
      service.setAutomaticCDN(false);
    }
  },
};