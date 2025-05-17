import { Nullable } from '../../../common/type/common-types';
import { ContentTypeEnum } from '../enum/content-type-enum';

export class ReferredContent {
  readonly id: string;

  readonly type: ContentTypeEnum;

  readonly thumbnailRelativePath: Nullable<string>;

  constructor(payload: {
    id: string;
    type: ContentTypeEnum;
    thumbnailRelativePath: Nullable<string>;
  }) {
    this.id = payload.id;
    this.type = payload.type;
    this.thumbnailRelativePath = payload.thumbnailRelativePath;
  }
}
