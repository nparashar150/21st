'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '../../lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        root: 'w-fit',
        months: 'flex flex-col gap-4',
        month: 'space-y-3',
        month_caption: 'relative flex h-10 items-center justify-center',
        caption_label: 'text-sm font-medium',
        nav: 'absolute inset-x-0 flex items-center justify-between px-2',
        button_previous: cn(
          'relative z-10 h-7 w-7 cursor-pointer inline-flex items-center justify-center rounded-md',
          'border border-input bg-background shadow-sm',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50'
        ),
        button_next: cn(
          'relative z-10 h-7 w-7 cursor-pointer inline-flex items-center justify-center rounded-md',
          'border border-input bg-background shadow-sm',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50'
        ),
        month_grid: 'w-full border-collapse mt-2',
        weekdays: 'flex',
        weekday: 'text-muted-foreground w-9 font-normal text-xs text-center',
        week: 'flex w-full mt-1',
        day: 'relative p-0 text-center text-sm',
        day_button: cn(
          'h-9 w-9 p-0 font-normal cursor-pointer inline-flex items-center justify-center rounded-md',
          'hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          'aria-selected:opacity-100',
          'transition-colors'
        ),
        range_end: 'day-range-end',
        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md',
        today: 'bg-accent text-accent-foreground rounded-md',
        outside: 'text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50 pointer-events-none',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        ...classNames
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') {
            return <ChevronLeft className='h-4 w-4' />;
          }
          return <ChevronRight className='h-4 w-4' />;
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
