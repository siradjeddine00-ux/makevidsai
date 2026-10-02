import { IVoiceProvider } from './types';
import { puterProvider } from '../puter';

export const activeVoiceProvider: IVoiceProvider = puterProvider;

export * from './types';
