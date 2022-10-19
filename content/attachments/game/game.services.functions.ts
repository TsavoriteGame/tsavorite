import { IAttachmentServices } from '../../interfaces';

let services: IAttachmentServices;

export function setServices(newServices: IAttachmentServices) {
  services = newServices;
}

export function getServices() {
  return services;
}
