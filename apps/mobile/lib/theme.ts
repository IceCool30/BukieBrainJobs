import { Platform } from 'react-native';
// Subpath import keeps the web-only component barrel out of the native bundle.
import { tradesColorTokens } from '@bukiebrainjobs/ui/src/tokens/colors';

export const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

export const colors = tradesColorTokens.dark;
