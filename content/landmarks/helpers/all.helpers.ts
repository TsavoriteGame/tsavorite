import { of } from 'rxjs';
import { ILandmarkEncounter } from '../../interfaces';

export const identity = (encounterOpts: ILandmarkEncounter) => of(encounterOpts);
