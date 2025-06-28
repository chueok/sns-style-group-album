import { create } from 'zustand';

type ContentState = {
  selectedContentId: string | null;
};

type ContentAction = {
  setSelectedContentId: (contentId: string | null) => void;
};

export const useContentStore = create<ContentState & ContentAction>((set) => ({
  selectedContentId: null,
  setSelectedContentId: (contentId: string | null) =>
    set({ selectedContentId: contentId }),
}));
