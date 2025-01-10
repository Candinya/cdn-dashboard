import { useEffect, useState } from 'react';
import { IconDeviceFloppy, IconPencil } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { Button, Code, FileInput, Flex, Group, Modal, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import type { AdditionalFileInfoInput } from '@/api/additional-file';
import { authTokenAtom } from '@/atoms/authToken';

interface AdditionalFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null; // null 表示创建新的
}
const AdditionalFileModal = ({ isOpen, onClose, id }: AdditionalFileModalProps) => {
  // 状态管理
  const authToken = useAtomValue(authTokenAtom);

  // 详细信息拉取请求
  const { data: info } = useQuery({
    queryKey: ['additional-file', 'info', id],
    queryFn: async () => {
      if (id) {
        return await API.AdditionalFileAPI.GetAdditionalFileInfo(authToken!, id);
      } else {
        return null;
      }
    },
  });

  const queryClient = useQueryClient();

  const emptyInfo = {
    name: '',
    content: null,
  };

  // 主表单
  const infoForm = useForm<AdditionalFileInfoInput>({
    mode: 'uncontrolled',
    initialValues: emptyInfo,
  });

  // 当信息变更时的操作
  useEffect(() => {
    if (isOpen) {
      if (info) {
        infoForm.setInitialValues(info);
      } else {
        infoForm.setInitialValues(emptyInfo);
      }
      infoForm.reset();
    }
  }, [info, isOpen]);

  // 锁定表单
  const [isFormUnlocked, setIsFormUnlocked] = useState<boolean>(false);

  // 开启时的初始化操作
  useEffect(() => {
    // 初始化时非新建则锁定
    if (isOpen) {
      setIsFormUnlocked(!id);
    }
  }, [isOpen]);

  // 提交主表单：更新
  const { isPending: isUpdating, mutate: updateInfo } = useMutation({
    mutationKey: ['additional-file', 'update', id, 'info'],
    mutationFn: (input: AdditionalFileInfoInput) => {
      // 更新，那么只需要更新 input
      return API.AdditionalFileAPI.UpdateAdditionalFileInfo(authToken!, id!, input);
    },
    onSuccess: (newInfo) => {
      queryClient.invalidateQueries({
        queryKey: ['additional-file', 'info', newInfo.id],
      });
      notifications.show({
        color: 'green',
        title: '额外文件信息更新成功',
        message: (
          <Text size="xs">
            额外文件 <Code>{newInfo.name}</Code> 信息更新成功
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '额外文件信息更新失败',
        message: e.message,
      });
    },
  });
  const { isPending: isReplacing, mutate: replaceFile } = useMutation({
    mutationKey: ['additional-file', 'replace', id, 'info'],
    mutationFn: (input: AdditionalFileInfoInput) => {
      // 更新，那么只需要更新 input
      return API.AdditionalFileAPI.ReplaceAdditionalFile(authToken!, id!, input);
    },
    onSuccess: (newInfo) => {
      queryClient.invalidateQueries({
        queryKey: ['additional-file', 'info', newInfo.id],
      });
      notifications.show({
        color: 'green',
        title: '额外文件替换成功',
        message: (
          <Text size="xs">
            额外文件 <Code>{newInfo.name}</Code> 替换成功
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '额外替换失败',
        message: e.message,
      });
    },
  });

  // 提交主表单：创建
  const { isPending: isCreating, mutate: create } = useMutation({
    mutationKey: ['additional-file', 'create'],
    mutationFn: (input: AdditionalFileInfoInput) => {
      return API.AdditionalFileAPI.CreateAdditionalFile(authToken!, input);
    },
    onSuccess: (newInfo) => {
      notifications.show({
        color: 'green',
        title: '额外文件创建成功',
        message: (
          <Text size="xs">
            成功创建了名为 <Code>{newInfo.name}</Code> 的额外文件 (#{newInfo.id})
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '额外文件创建失败',
        message: e.message,
      });
    },
  });

  const submitForm = (input: AdditionalFileInfoInput) => {
    if (!id) {
      // 创建
      create(input);
    } else {
      // 更新信息
      updateInfo(input);
      if (infoForm.isDirty('content')) {
        replaceFile(input);
      }
    }
  };

  // 表单结构
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={id ? `编辑额外文件 #${id}` : '创建新额外文件'}
      size="xl"
    >
      <form onSubmit={infoForm.onSubmit(submitForm)}>
        <Flex direction="column" gap="sm">
          <TextInput label="名称" disabled={!isFormUnlocked} {...infoForm.getInputProps('name')} />

          <TextInput
            label="文件名"
            disabled={!isFormUnlocked}
            {...infoForm.getInputProps('filename')}
          />

          <FileInput
            label="文件"
            disabled={!isFormUnlocked}
            placeholder={info?.filename || '选择文件'}
            {...infoForm.getInputProps('content')}
          />

          <Group justify="end" mt="sm">
            {isFormUnlocked ? (
              <Button
                leftSection={<IconDeviceFloppy size={14} />}
                type="submit"
                loading={isUpdating || isCreating}
              >
                保存
              </Button>
            ) : (
              <Button
                color="green"
                leftSection={<IconPencil size={14} />}
                onClick={(ev) => {
                  ev.preventDefault();
                  setIsFormUnlocked(true);
                }}
              >
                编辑
              </Button>
            )}
          </Group>
        </Flex>
      </form>
    </Modal>
  );
};

export default AdditionalFileModal;
