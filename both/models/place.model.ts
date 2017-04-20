import { CollectionObject } from "./collection-object.model";

export interface Place extends CollectionObject {
  name: string;
  slug: string;
  geometry: {
    lat: number;
    lng: number;
  },
  address?: string;
  active: boolean;
  deleted: boolean;
  createdAt: Date;
  modifiedAt: Date;
}
