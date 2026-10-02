import { IVideoProvider } from './types';
import { puterProvider } from '../puter';

// Current active video provider - easily swappable with another adapter
export const activeVideoProvider: IVideoProvider = puterProvider;

export * from './types';
