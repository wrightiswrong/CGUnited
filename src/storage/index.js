// Swap point: change this one import/instantiation to move from localStorage
// to Firebase/Supabase/SQL later. Nothing else in the app should change.
import { LocalStoragePlayerRepository } from './LocalStoragePlayerRepository.js';

export const playerRepository = new LocalStoragePlayerRepository();
