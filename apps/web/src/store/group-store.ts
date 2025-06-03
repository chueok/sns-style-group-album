import { create } from 'zustand';

type GroupState = {
  selectedGroupId: string | null;
};

type GroupAction = {
  setSelectedGroupId: (groupId: string | null) => void;
};

export const useGroupStore = create<GroupState & GroupAction>((set) => ({
  selectedGroupId: null,
  setSelectedGroupId: (groupId: string | null) =>
    set({ selectedGroupId: groupId }),
}));
