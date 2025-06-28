'use client';

import { useState } from 'react';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu';

import {
  Search,
  MoreHorizontal,
  Filter,
  ArrowUpDown,
  Map,
  Clock,
  MessageCircle,
  Heart,
  ChevronRight,
} from 'lucide-react';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('');

  const handleSortSelect = (sortType: string) => {
    setSelectedSort(sortType);
    console.log(`Sorted by: ${sortType}`);
  };

  return (
    <div className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-3 tw-border-b">
      <div className="tw-relative tw-flex-1">
        <Search className="tw-absolute tw-left-3 tw-top-1/2 tw-transform tw--translate-y-1/2 tw-text-gray-400 tw-w-4 tw-h-4" />
        <Input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="tw-pl-10 tw-pr-4 tw-py-2 tw-border-0 tw-bg-gray-100 tw-rounded-lg focus:tw-ring-2 focus:tw-ring-blue-500"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="tw-h-8 tw-w-8">
            <MoreHorizontal className="tw-h-4 tw-w-4" />
            <span className="tw-sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="tw-w-48">
          <DropdownMenuItem className="tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-items-center tw-gap-2">
              <Filter className="tw-h-4 tw-w-4" />
              <span>Filter</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="tw-flex tw-items-center tw-justify-between">
              <div className="tw-flex tw-items-center tw-gap-2">
                <ArrowUpDown className="tw-h-4 tw-w-4" />
                <span>Sort</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="tw-w-48">
              <DropdownMenuItem
                onClick={() => handleSortSelect('time')}
                className="tw-flex tw-items-center tw-gap-2"
              >
                <Clock className="h-4 w-4" />
                <span>Sort by Time</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortSelect('comments')}
                className="tw-flex tw-items-center tw-gap-2"
              >
                <MessageCircle className="tw-h-4 tw-w-4" />
                <span>Sort by Comments</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortSelect('likes')}
                className="tw-flex tw-items-center tw-gap-2"
              >
                <Heart className="tw-h-4 tw-w-4" />
                <span>Sort by Likes</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="tw-flex tw-items-center tw-justify-between">
            <div className="tw-flex tw-items-center tw-gap-2">
              <Map className="tw-h-4 tw-w-4" />
              <span>View Map</span>
            </div>
            <ChevronRight className="tw-h-4 tw-w-4" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
