import { create } from 'zustand';

type GroupState = {
  selectedGroupId: string | undefined;
};

type GroupAction = {
  setSelectedGroupId: (groupId: string | undefined) => void;
};

export const useGroupStore = create<GroupState & GroupAction>((set) => ({
  selectedGroupId: undefined,
  setSelectedGroupId: (groupId: string | undefined) =>
    set({ selectedGroupId: groupId }),
}));
