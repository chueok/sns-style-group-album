'use client';

import { ChangeEvent, MouseEvent, useRef, useState } from 'react';
import { Input } from '@repo/ui/input';
import { Button } from '@repo/ui/button';

const API_URL = 'http://localhost:3001';

function blobToUrl(file: File): Promise<string> {
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.onload = (e) => {
      const { target } = e;
      if (!target) {
        reject(target);
        return;
      }
      resolve(target.result as string);
    };
    reader.readAsDataURL(file);
  });
}

export default function Upload() {
  const [imageList, setImageList] = useState<{ src: string; file: File }[]>([]);
  const [groupId, setGroupId] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const fileList = e.currentTarget.files;
    if (!fileList || fileList.length === 0) return;

    [...fileList].forEach((file) => {
      blobToUrl(file).then((src) => {
        setImageList((prev) => [
          ...prev,
          {
            src,
            file,
          },
        ]);
      });
    });
  };

  const onClickUpload = async () => {
    if (!groupId) {
      return;
    }
    // TODO: upload api 연동
    console.log(imageList);

    const body: { data: { presignedUrlList: string[] } } = await fetch(
      `${API_URL}/contents/group/${groupId}/medias`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          mode: 'no-cors',
        },
        body: JSON.stringify({
          numContent: imageList.length,
        }),
      }
    ).then((res) => {
      if (res.ok) return res.json();
      throw res;
    });
    await Promise.allSettled(
      imageList.map(({ file }, index) => {
        return fetch(body.data.presignedUrlList[index] as string, {
          body: file,
          method: 'POST',
        });
      })
    );
  };

  return (
    <div>
      <Button onClick={onClick}>Select</Button>
      <Button onClick={onClickUpload} disabled={imageList.length === 0}>
        Upload
      </Button>
      <Input
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        placeholder="GroupId"
      />
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onImageChange}
        className="tw-hidden"
      />
      {imageList.map(({ src, file }, index) => {
        return (
          <img
            key={index}
            src={src}
            alt={file.name}
            className="tw-border tw-border-[black]"
          />
        );
      })}
    </div>
  );
}
