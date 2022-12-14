import { decreaseDescriptorLevel, getDescriptorLevel } from '../helpers';
import { Descriptor, IItemConfig, MiddlewareType,
  PostCombineMiddleware,
  PostReactionMiddleware, IReactionExtendedArgs, IReactionResponse } from '../interfaces';

export function shouldCombust(item: IItemConfig) {
  return getDescriptorLevel(item, Descriptor.Combustible) > 0;
}

/**
 * We check if the target item is hot and cold simultaneously
 */
export class TemperatureRegulation implements PostReactionMiddleware, PostCombineMiddleware {

  triggers: MiddlewareType[] = ['postreaction', 'postcombine'];

  // check whether there is at least one extra item
  private isExtraItemsDefined(response: IReactionResponse): boolean {
    return response.extraItems && response.extraItems.length > 0;
  }

  // check the number of hots vs the number of colds
  private needsTemperatureChange(item: IItemConfig): boolean {
    if(!item) {
      return false;
    }

    const hotLevel = getDescriptorLevel(item, Descriptor.Hot) + getDescriptorLevel(item, Descriptor.Blazing);
    const coldLevel = getDescriptorLevel(item, Descriptor.Cold) + getDescriptorLevel(item, Descriptor.Frozen);

    return hotLevel > 0 && coldLevel > 0;
  }

  // lower the number of hots vs number of colds, based on how many of each there is
  private regulateTemperature(item: IItemConfig): boolean {
    if(!item) {
      return false;
    }

    let hotLevel = 0;
    let coldLevel = 0;

    do {
      hotLevel = getDescriptorLevel(item, Descriptor.Hot) + getDescriptorLevel(item, Descriptor.Blazing);
      coldLevel = getDescriptorLevel(item, Descriptor.Cold) + getDescriptorLevel(item, Descriptor.Frozen);

      if(hotLevel > 0 && coldLevel > 0) {
        decreaseDescriptorLevel(item, Descriptor.Hot, 1);
        decreaseDescriptorLevel(item, Descriptor.Blazing, 1);
        decreaseDescriptorLevel(item, Descriptor.Cold, 1);
        decreaseDescriptorLevel(item, Descriptor.Frozen, 1);
      }

    } while(hotLevel > 0 && coldLevel > 0);

    return true;
  }

  // this is enabled by default
  isEnabled() {
    return true;
  }

  /*
   * Here, we only check if we have glass and it should shatter (temperature-wise)
   */
  shouldPostFire(args: IReactionExtendedArgs, response: IReactionResponse) {

    let extraItemsShouldFire = this.isExtraItemsDefined(response);
    if (extraItemsShouldFire) {
      extraItemsShouldFire = false;
      response.extraItems.forEach(item => {
        if (extraItemsShouldFire) {
          return;
        }
        if (this.needsTemperatureChange(item)) {
          extraItemsShouldFire = true;
        }
      });
    }

    return response.success
        && (this.needsTemperatureChange(args.sourceItem) || this.needsTemperatureChange(args.targetItem)
          || extraItemsShouldFire);
  }

  // this should never block other post- middleware
  shouldPostBlock() {
    return false;
  }

  post(args: IReactionExtendedArgs, response: IReactionResponse) {

    let sourceChanged = false;
    let targetChanged = false;

    if(this.needsTemperatureChange(args.sourceItem)) {
      sourceChanged = this.regulateTemperature(args.sourceItem);
    }
    if(this.needsTemperatureChange(args.targetItem)) {
      targetChanged = this.regulateTemperature(args.targetItem);
    }

    if(sourceChanged) {
      response.message = `${response.message} Source temperature regulated!`;
    }
    if(targetChanged) {
      response.message = `${response.message} Target temperature regulated!`;
    }

    if (this.isExtraItemsDefined(response)) {
      response.extraItems.forEach((item, idx) => {
        let itemChanged = false;
        if(this.needsTemperatureChange(item)) {
          itemChanged = this.regulateTemperature(item);
        }

        if (itemChanged) {
          response.message = `${response.message} Extra item ${idx} temperature regulated!`;
        }
      });
    }


    response.success = true;

    return response;
  }
}
