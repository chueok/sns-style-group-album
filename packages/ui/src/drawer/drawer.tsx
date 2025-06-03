'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';

import { cn } from '@/lib/utils';

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    data-slot="drawer-overlay"
    className={cn(
      'data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 tw-fixed tw-inset-0 tw-z-50 tw-bg-black/50',
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = 'DrawerOverlay';

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          'group/drawer-content tw-bg-background tw-fixed tw-z-50 tw-flex tw-h-auto tw-flex-col',
          'data-[vaul-drawer-direction=top]:tw-inset-x-0 data-[vaul-drawer-direction=top]:tw-top-0 data-[vaul-drawer-direction=top]:tw-mb-24 data-[vaul-drawer-direction=top]:tw-max-h-[80vh] data-[vaul-drawer-direction=top]:tw-rounded-b-lg data-[vaul-drawer-direction=top]:tw-border-b',
          'data-[vaul-drawer-direction=bottom]:tw-inset-x-0 data-[vaul-drawer-direction=bottom]:tw-bottom-0 data-[vaul-drawer-direction=bottom]:tw-mt-24 data-[vaul-drawer-direction=bottom]:tw-max-h-[80vh] data-[vaul-drawer-direction=bottom]:tw-rounded-t-lg data-[vaul-drawer-direction=bottom]:tw-border-t',
          'data-[vaul-drawer-direction=right]:tw-inset-y-0 data-[vaul-drawer-direction=right]:tw-right-0 data-[vaul-drawer-direction=right]:tw-w-3/4 data-[vaul-drawer-direction=right]:tw-border-l data-[vaul-drawer-direction=right]:tw-sm:tw-max-w-sm',
          'data-[vaul-drawer-direction=left]:tw-inset-y-0 data-[vaul-drawer-direction=left]:tw-left-0 data-[vaul-drawer-direction=left]:tw-w-3/4 data-[vaul-drawer-direction=left]:tw-border-r data-[vaul-drawer-direction=left]:tw-sm:tw-max-w-sm',
          className
        )}
        {...props}
      >
        <div className="tw-bg-muted tw-mx-auto tw-mt-4 tw-hidden tw-h-2 tw-w-[100px] tw-shrink-0 tw-rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:tw-block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-header"
      className={cn('tw-flex tw-flex-col tw-gap-1.5 tw-p-4', className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        'tw-mt-auto tw-flex tw-flex-col tw-gap-2 tw-p-4',
        className
      )}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('tw-text-foreground tw-font-semibold', className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('tw-text-muted-foreground tw-text-sm', className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
