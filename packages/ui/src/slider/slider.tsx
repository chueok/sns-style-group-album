'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'tw-relative tw-flex tw-full tw-touch-none tw-items-center tw-select-none data-[disabled]:tw-opacity-50 data-[orientation=vertical]:tw-h-full data-[orientation=vertical]:tw-min-h-44 data-[orientation=vertical]:tw-w-auto data-[orientation=vertical]:tw-flex-col',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          'tw-bg-muted tw-relative tw-grow tw-overflow-hidden tw-rounded-full data-[orientation=horizontal]:tw-h-1.5 data-[orientation=horizontal]:tw-w-full data-[orientation=vertical]:tw-h-full data-[orientation=vertical]:tw-w-1.5'
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            'tw-bg-primary tw-absolute data-[orientation=horizontal]:tw-h-full data-[orientation=vertical]:tw-w-full'
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="tw-border-primary tw-bg-background tw-ring-ring/50 tw-block tw-size-4 tw-shrink-0 tw-rounded-full tw-border tw-shadow-sm tw-transition-[color,box-shadow] hover:tw-ring-4 focus-visible:tw-ring-4 focus-visible:tw-outline-hidden disabled:tw-pointer-events-none disabled:tw-opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
