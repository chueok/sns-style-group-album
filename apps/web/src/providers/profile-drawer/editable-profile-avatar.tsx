'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@repo/ui/avatar';
import { Button } from '@repo/ui/button';
import { useAuth } from '@/trpc/hooks/auth/use-auth';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: File | null) => void; // null: 이미지 삭제, File: 이미지 업로드
  fallbackText: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EditableProfileAvatar({
  currentImage,
  onImageChange,
  fallbackText,
  size = 'lg',
}: ImageUploadProps) {
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | undefined>(
    currentImage
  );

  // 이미지 업로드 처리
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'tw-w-16 tw-h-16',
    md: 'tw-w-20 tw-h-20',
    lg: 'tw-w-24 tw-h-24',
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    setAvatarImageUrl(undefined);
  };

  // 1. file select: image tag에 image load
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        // const croppedImageUrl = cropProfileImage(fileInputRef);
        // console.log(croppedImageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. image load 를 통해 image의 기본 가로/세로 크기를 확인하여 크롭 처리
  const imageRef = useRef<HTMLImageElement>(null);
  const handleImageLoad = async () => {
    const canvas = cropProfileImage(imageRef);
    if (canvas) {
      try {
        const file = await blobToFile(canvas);
        onImageChange(file);
        setAvatarImageUrl(URL.createObjectURL(file));

        canvas.remove();
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
  };

  return (
    <div className="tw-w-full tw-flex tw-flex-col tw-items-center tw-space-y-4">
      <div className="tw-relative tw-group">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage
            src={avatarImageUrl || '/placeholder.svg'}
            alt="Profile"
          />
          <AvatarFallback className="tw-text-lg">{fallbackText}</AvatarFallback>
        </Avatar>

        {avatarImageUrl && (
          <Button
            size="icon"
            variant="ghost"
            className="tw-absolute tw--top-2 tw--right-2 tw-w-6 tw-h-6 tw-rounded-full tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity"
            onClick={handleRemoveImage}
          >
            <X className="tw-w-3 tw-h-3 tw-text-destructive" />
          </Button>
        )}
        <Button
          size="icon"
          variant="outline"
          className="tw-absolute tw--bottom-2 tw--right-2 tw-rounded-full tw-w-8 tw-h-8"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="tw-w-4 tw-h-4" />
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="tw-hidden"
      />
      <img
        ref={imageRef}
        src={selectedImage || undefined}
        className="tw-hidden"
        onLoad={handleImageLoad}
      />
    </div>
  );
}

const cropProfileImage = (imageRef: React.RefObject<HTMLImageElement>) => {
  const image = imageRef.current;
  if (!image) return;

  // 1. 먼저 정사각형으로 크롭
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');
  if (!cropCtx) {
    cropCanvas.remove();
    return;
  }

  const maxLength = Math.min(image.naturalWidth, image.naturalHeight);
  cropCanvas.width = maxLength;
  cropCanvas.height = maxLength;

  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;

  // 중앙에서 정사각형으로 크롭
  cropCtx.drawImage(
    image,
    imageWidth / 2 - maxLength / 2,
    imageHeight / 2 - maxLength / 2,
    maxLength,
    maxLength,
    0,
    0,
    maxLength,
    maxLength
  );

  // 2. 크롭된 이미지를 400x400으로 리사이징
  const resizeCanvas = document.createElement('canvas');
  const resizeCtx = resizeCanvas.getContext('2d');
  if (!resizeCtx) {
    cropCanvas.remove();
    resizeCanvas.remove();
    return;
  }

  resizeCanvas.width = 400;
  resizeCanvas.height = 400;

  // 크롭된 이미지를 400x400으로 리사이징
  resizeCtx.drawImage(cropCanvas, 0, 0, maxLength, maxLength, 0, 0, 400, 400);

  cropCanvas.remove();
  resizeCanvas.remove();
  return resizeCanvas;
};

const blobToFile = async (canvas: HTMLCanvasElement): Promise<File> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }
        const file = new File([blob], 'profile-image.jpg', {
          type: 'image/jpeg',
        });
        resolve(file);
      },
      'image/jpeg',
      0.9
    );
  });
};
