import { trpc } from '@/trpc/trpc';

// TODO: 기능 별로 구분 필요 (isPending 사용 목적)
export const useAuth = () => {
  const utils = trpc.useUtils();

  // cookie 보안 정책으로 인해, cookie를 통해 로그인 여부 확인하기가 어려움
  // 따라서 getMe를 통해 로그인 여부를 확인하고, 로그아웃 시 로그인 여부를 초기화함
  const { data: user } = trpc.user.getMe.useQuery(undefined, {
    // gcTime: Infinity, // component unmount 이후 데이터를 유지하는 시간
    staleTime: Infinity,
  });

  const { mutateAsync: logoutMutation } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.user.getMe.reset();
      utils.group.getMyMemberGroups.reset();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });

  const logout = async () => {
    if (!user) {
      return;
    }
    return logoutMutation();
  };

  const { mutateAsync: editProfileMutation } =
    trpc.user.editDefaultProfile.useMutation({
      onSuccess: () => {
        utils.user.getMe.invalidate();
      },
      onError: (error) => {
        console.error('Edit profile failed:', error);
      },
    });

  const editUsername = async (username: string) => {
    if (!user) {
      return;
    }
    return editProfileMutation({ username });
  };

  const { mutateAsync: generateProfileImageUploadUrlMutation } =
    trpc.user.generateProfileImageUploadUrl.useMutation({});

  const editProfileImage = async (file: File) => {
    if (!user) {
      return;
    }

    if (file.size > 1024 * 1024) {
      throw new Error('프로필 이미지는 1MB 이하여야 합니다.');
    }

    const { url } = await generateProfileImageUploadUrlMutation();

    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload profile image');
    }

    await utils.user.getMe.invalidate();

    return;
  };

  const { mutateAsync: deleteProfileImageMutation } =
    trpc.user.deleteProfileImage.useMutation({
      onSuccess: () => {
        utils.user.getMe.invalidate();
      },
    });

  const deleteProfileImage = async () => {
    if (!user) {
      return;
    }
    return deleteProfileImageMutation();
  };

  return { user, logout, editUsername, editProfileImage, deleteProfileImage };
};
