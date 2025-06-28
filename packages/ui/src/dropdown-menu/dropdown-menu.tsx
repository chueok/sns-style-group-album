'use client';

import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { CheckIcon, ChevronRightIcon, CircleIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return (
    <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
  );
}

function DropdownMenuTrigger({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      {...props}
    />
  );
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          'tw-bg-popover tw-text-popover-foreground data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2 tw-z-50 tw-max-h-(--radix-dropdown-menu-content-available-height) tw-min-w-[8rem] tw-origin-(--radix-dropdown-menu-content-transform-origin) tw-overflow-x-hidden tw-overflow-y-auto tw-rounded-md tw-border tw-p-1 tw-shadow-md',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return (
    <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:tw-bg-accent focus:tw-text-accent-foreground data-[variant=destructive]:tw-text-destructive data-[variant=destructive]:focus:tw-bg-destructive/10 dark:data-[variant=destructive]:focus:tw-bg-destructive/20 data-[variant=destructive]:focus:tw-text-destructive data-[variant=destructive]:*:[svg]:!tw-text-destructive [&_svg:not([class*='text-'])]:tw-text-muted-foreground tw-relative tw-flex tw-cursor-default tw-items-center tw-gap-2 tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm tw-outline-hidden tw-select-none data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50 tw-data-[inset]:tw-pl-8 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0 [&_svg:not([class*='size-'])]:tw-size-4",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:tw-bg-accent focus:tw-text-accent-foreground tw-relative tw-flex tw-cursor-default tw-items-center tw-gap-2 tw-rounded-sm tw-py-1.5 tw-pr-2 tw-pl-8 tw-text-sm tw-outline-hidden tw-select-none data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0 [&_svg:not([class*='size-'])]:tw-size-4",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="tw-pointer-events-none tw-absolute tw-left-2 tw-flex tw-size-3.5 tw-items-center tw-justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="tw-size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return (
    <DropdownMenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:tw-bg-accent focus:tw-text-accent-foreground tw-relative tw-flex tw-cursor-default tw-items-center tw-gap-2 tw-rounded-sm tw-py-1.5 tw-pr-2 tw-pl-8 tw-text-sm tw-outline-hidden tw-select-none data-[disabled]:tw-pointer-events-none data-[disabled]:tw-opacity-50 [&_svg]:tw-pointer-events-none [&_svg]:tw-shrink-0 [&_svg:not([class*='size-'])]:tw-size-4",
        className
      )}
      {...props}
    >
      <span className="tw-pointer-events-none tw-absolute tw-left-2 tw-flex tw-size-3.5 tw-items-center tw-justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="tw-size-2 tw-fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        'tw-px-2 tw-py-1.5 tw-text-sm tw-font-medium data-[inset]:tw-pl-8',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn('tw-bg-border tw-mx-1 tw-my-1 tw-h-px', className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        'tw-text-muted-foreground tw-ml-auto tw-text-xs tw-tracking-widest',
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSub({
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        'focus:tw-bg-accent focus:tw-text-accent-foreground data-[state=open]:tw-bg-accent data-[state=open]:tw-text-accent-foreground tw-flex tw-cursor-default tw-items-center tw-rounded-sm tw-px-2 tw-py-1.5 tw-text-sm tw-outline-hidden tw-select-none data-[inset]:tw-pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="tw-ml-auto tw-size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        'tw-bg-popover tw-text-popover-foreground data-[state=open]:tw-animate-in data-[state=closed]:tw-animate-out data-[state=closed]:tw-fade-out-0 data-[state=open]:tw-fade-in-0 data-[state=closed]:tw-zoom-out-95 data-[state=open]:tw-zoom-in-95 data-[side=bottom]:tw-slide-in-from-top-2 data-[side=left]:tw-slide-in-from-right-2 data-[side=right]:tw-slide-in-from-left-2 data-[side=top]:tw-slide-in-from-bottom-2 tw-z-50 tw-min-w-[8rem] tw-origin-(--radix-dropdown-menu-content-transform-origin) tw-overflow-hidden tw-rounded-md tw-border tw-p-1 tw-shadow-lg',
        className
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
