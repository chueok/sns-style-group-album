import { Nullable } from '../../../common/type/common-types';
import { EContentCategory } from '../type/content-category';

export class ReferredContent {
  readonly id: string;

  readonly type: EContentCategory;

  readonly thumbnailRelativePath: Nullable<string>;

  constructor(payload: {
    id: string;
    type: EContentCategory;
    thumbnailRelativePath: Nullable<string>;
  }) {
    this.id = payload.id;
    this.type = payload.type;
    this.thumbnailRelativePath = payload.thumbnailRelativePath;
  }
}
