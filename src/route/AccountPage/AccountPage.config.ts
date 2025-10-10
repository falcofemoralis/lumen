import { PresetConfig } from 'react-native-animated-glow';

export const ACCOUNT_ROUTE = 'Account';

export const defaultPreset: PresetConfig = {
  metadata: {
    name: 'Default Preset',
    textColor: '#FFFFFF',
    category: 'Custom',
    tags: [],
  },
  states: [
    {
      name: 'default',
      preset: {
        cornerRadius: 99,
        outlineWidth: 2,
        borderColor: '#E0FFFF',
        glowLayers: [
          { colors: ['#EA1B45','#FC5909'], opacity: 0.5, glowSize: 48 },
        ],
      },
    },
  ],
};

export const premiumPreset: PresetConfig = {
  metadata: {
    name: 'Premium Preset',
    textColor: '#FFFFFF',
    category: 'Custom',
    tags: [],
  },
  states: [
    {
      name: 'default', // The base style for the component
      preset: {
        cornerRadius: 99,
        outlineWidth: 2,
        borderColor: '#E0FFFF',
        glowLayers: [
          { colors: ['#D819E0','#079BB1'], opacity: 0.5, glowSize: 48 },
        ],
      },
    },
  ],
};