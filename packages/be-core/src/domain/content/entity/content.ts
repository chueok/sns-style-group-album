import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMimeType,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";
import { ContentTypeEnum } from "../enum/content-type-enum";
import { BucketStatusEnum } from "../enum/bucket-status";
import { Content } from "./content.abstract";

import { Nullable } from "../../../common/type/common-types";
import { CreateContentEntityPayload } from "./type/create-content-entity-payload";

export class SystemContent extends Content {
  override readonly _type: ContentTypeEnum.SYSTEM = ContentTypeEnum.SYSTEM;

  @IsString()
  protected _text: string;
  get text(): string {
    return this._text;
  }

  @IsOptional()
  @IsString()
  protected _subText: Nullable<string>;
  get subText(): Nullable<string> {
    return this._subText;
  }

  constructor(payload: CreateContentEntityPayload<"system", "all">) {
    super(payload);
    this._text = payload.text;
    this._subText = payload.subText;
  }

  static async new(payload: CreateContentEntityPayload<"system", "all">) {
    const entity = new SystemContent(payload);
    await entity.validate();
    return entity;
  }
}

export class MediaContent extends Content {
  protected override _type: ContentTypeEnum.VIDEO | ContentTypeEnum.IMAGE;
  get type(): ContentTypeEnum.VIDEO | ContentTypeEnum.IMAGE {
    return this._type;
  }

  @IsOptional()
  @IsUrl()
  protected _largeRelativePath: Nullable<string>;
  get largeRelativePath(): Nullable<string> {
    return this._largeRelativePath;
  }

  @IsUrl()
  protected _originalRelativePath: string;
  get originalRelativePath(): string {
    return this._originalRelativePath;
  }

  @IsNumber()
  protected _size: number;
  get size(): number {
    return this._size;
  }

  @IsString()
  protected _ext: string;
  get ext(): string {
    return this._ext;
  }

  @IsMimeType()
  protected _mimetype!: string;
  get mimetype(): string {
    return this._mimetype;
  }

  constructor(payload: CreateContentEntityPayload<"media", "all">) {
    super(payload);
    this._type = payload.type;
    this._largeRelativePath = payload.largeRelativePath;
    this._originalRelativePath = payload.originalRelativePath;
    this._size = payload.size;
    this._ext = payload.ext;
    this._mimetype = payload.mimeType;
  }

  static async new(payload: CreateContentEntityPayload<"media", "all">) {
    const entity = new MediaContent(payload);
    await entity.validate();
    return entity;
  }
}

export class ImageContent extends MediaContent {
  override _type: ContentTypeEnum.IMAGE = ContentTypeEnum.IMAGE;

  constructor(payload: CreateContentEntityPayload<"image", "all">) {
    super({ ...payload, type: ContentTypeEnum.IMAGE });
  }

  static async new(payload: CreateContentEntityPayload<"image", "all">) {
    const entity = new ImageContent(payload);
    await entity.validate();
    return entity;
  }
}

export class VideoContent extends MediaContent {
  override _type: ContentTypeEnum.VIDEO = ContentTypeEnum.VIDEO;

  constructor(payload: CreateContentEntityPayload<"video", "all">) {
    super({ ...payload, type: ContentTypeEnum.VIDEO, largeRelativePath: null });
  }

  static async new(payload: CreateContentEntityPayload<"video", "all">) {
    const entity = new VideoContent(payload);
    await entity.validate();
    return entity;
  }
}

export class PostContent extends Content {
  override _type: ContentTypeEnum.POST = ContentTypeEnum.POST;

  @IsString()
  protected _title: string;
  get title(): string {
    return this._title;
  }

  @IsString()
  protected _text: string;
  get text(): string {
    return this._text;
  }

  constructor(payload: CreateContentEntityPayload<"post", "all">) {
    super(payload);
    this._title = payload.title;
    this._text = payload.text;
  }

  static async new(payload: CreateContentEntityPayload<"post", "all">) {
    const entity = new PostContent(payload);
    await entity.validate();
    return entity;
  }
}

export class BucketContent extends Content {
  override _type: ContentTypeEnum.BUCKET = ContentTypeEnum.BUCKET;

  @IsString()
  protected _title: string;
  get title(): string {
    return this._title;
  }

  @IsEnum(BucketStatusEnum)
  protected _status: BucketStatusEnum;
  get status(): BucketStatusEnum {
    return this._status;
  }

  constructor(payload: CreateContentEntityPayload<"bucket", "all">) {
    super(payload);
    this._title = payload.title;
    this._status = payload.status;
  }

  static async new(payload: CreateContentEntityPayload<"bucket", "all">) {
    const entity = new BucketContent(payload);
    await entity.validate();
    return entity;
  }
}

export class ScheduleContent extends Content {
  override _type: ContentTypeEnum.SCHEDULE = ContentTypeEnum.SCHEDULE;

  @IsString()
  protected _title: string;
  get title(): string {
    return this._title;
  }

  @IsOptional()
  @IsDate()
  protected _startDateTime: Nullable<Date>;
  get startDateTime(): Nullable<Date> {
    return this._startDateTime;
  }

  @IsDate()
  protected _endDateTime: Date;
  get endDateTime(): Date {
    return this._endDateTime;
  }

  @IsBoolean()
  protected _isAllDay: boolean;
  get isAllDay(): boolean {
    return this._isAllDay;
  }

  constructor(payload: CreateContentEntityPayload<"schedule", "all">) {
    super(payload);
    this._title = payload.title;
    this._startDateTime = payload.startDateTime;
    this._endDateTime = payload.endDateTime;
    this._isAllDay = payload.isAllDay;
  }

  static async new(payload: CreateContentEntityPayload<"schedule", "all">) {
    const entity = new ScheduleContent(payload);
    await entity.validate();
    return entity;
  }
}
