import { StateContext } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { Observable, Subscription } from 'rxjs';
import { IGame, IGameCharacter, ILandmarkEncounter } from '../../interfaces';


let landmarkSubscription: Subscription;

export function updateLandmark(ctx: StateContext<IGame>, observable: Observable<ILandmarkEncounter>) {
  landmarkSubscription = observable.subscribe(landmarkEncounterData => {
    const canMove = landmarkEncounterData.canLeave;
    const disallowHealthUpdates = landmarkEncounterData.disallowHealthUpdates;

    ctx.setState(patch<IGame>({
      landmarkEncounter: landmarkEncounterData,
      character: patch<IGameCharacter>({
        stuck: !canMove,
        disallowHealthUpdates
      })
    }));
  });
}

export function cancelLandmark() {
  if(!landmarkSubscription) {
    return;
  }

  landmarkSubscription.unsubscribe();
}
