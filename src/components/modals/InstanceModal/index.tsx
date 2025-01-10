import { useEffect, useState } from 'react';
import { IconDeviceFloppy, IconPencil } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import {
  Button,
  Code,
  Flex,
  Group,
  Modal,
  MultiSelect,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import type { InstanceInfoInput } from '@/api/instance';
import { authTokenAtom } from '@/atoms/authToken';

interface InstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null; // null 表示创建新的
}
const InstanceModal = ({ isOpen, onClose, id }: InstanceModalProps) => {
  // 状态管理
  const authToken = useAtomValue(authTokenAtom);

  // 详细信息拉取请求
  const { data: instanceInfo } = useQuery({
    queryKey: ['instance', 'info', id],
    queryFn: async () => {
      if (id) {
        return await API.InstanceAPI.GetInstanceInfo(authToken!, id);
      } else {
        return null;
      }
    },
  });

  const { isPending: isLoadingSiteList, data: siteList } = useQuery({
    queryKey: ['site', 'list', 'all'],
    queryFn: () => API.SiteAPI.GetSiteList(authToken!, 0, 0),
  });

  const { isPending: isLoadingAdditionalFileList, data: additionalFileList } = useQuery({
    queryKey: ['additional-file', 'list', 'all'],
    queryFn: () => API.AdditionalFileAPI.GetAdditionalFileList(authToken!, 0, 0),
  });

  const queryClient = useQueryClient();

  const emptyInfo: Omit<InstanceInfoInput, 'site_ids' | 'additional_file_ids'> & {
    site_ids: string[];
    additional_file_ids: string[];
  } = {
    name: '',
    pre_config: '',
    is_manual_mode: false,
    site_ids: [],
    additional_file_ids: [],
  };

  // 主表单
  const infoForm = useForm({
    mode: 'controlled', // 加载值需要一定时间，编辑模式下可能导致 variables 的值无法正常加载，暂时没想到更好的方法就先用 controlled 状态了
    initialValues: emptyInfo,
  });

  // 当信息变更时的操作
  useEffect(() => {
    if (isOpen) {
      if (instanceInfo) {
        infoForm.setInitialValues({
          ...instanceInfo,
          site_ids: instanceInfo.site_ids.map((id) => id.toString()),
          additional_file_ids: instanceInfo.additional_file_ids.map((id) => id.toString()),
        });
      } else {
        infoForm.setInitialValues(emptyInfo);
      }
      infoForm.reset();
    }
  }, [instanceInfo, isOpen]);

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
    mutationKey: ['instance', 'update', id, 'info'],
    mutationFn: (input: InstanceInfoInput) => {
      // 更新，那么只需要更新 input
      return API.InstanceAPI.UpdateInstanceInfo(authToken!, id!, input);
    },
    onSuccess: (newInfo) => {
      queryClient.invalidateQueries({
        queryKey: ['instance', 'info', newInfo.id],
      });
      notifications.show({
        color: 'green',
        title: '实例信息更新成功',
        message: (
          <Text size="xs">
            实例 <Code>{newInfo.name}</Code> 信息更新成功
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '实例信息更新失败',
        message: e.message,
      });
    },
  });

  // 提交主表单：创建
  const { isPending: isCreating, mutate: create } = useMutation({
    mutationKey: ['instance', 'create'],
    mutationFn: (input: InstanceInfoInput) => {
      return API.InstanceAPI.CreateInstance(authToken!, input);
    },
    onSuccess: (newInfo) => {
      notifications.show({
        color: 'green',
        title: '实例创建成功',
        message: (
          <Text size="xs">
            成功创建了名为 <Code>{newInfo.name}</Code> 的实例 (#{newInfo.id})
          </Text>
        ),
      });
      onClose();
      modals.openConfirmModal({
        title: '新实例的认证令牌',
        children: (
          <>
            <Text size="sm">新实例的认证令牌如下，请妥善保存，它不会再显示。</Text>
            <Code ta="center" mt="xs" block>
              {newInfo.token}
            </Code>
          </>
        ),
        labels: { confirm: '复制并关闭', cancel: '关闭' },
        onConfirm: () => {
          window.navigator.clipboard.writeText(newInfo.token);
        },
      });
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '实例创建失败',
        message: e.message,
      });
    },
  });

  const submitForm = (input: typeof emptyInfo) => {
    const parsedInput: InstanceInfoInput = {
      ...input,
      site_ids: input.site_ids.map((e) => parseInt(e)),
      additional_file_ids: input.additional_file_ids.map((e) => parseInt(e)),
    };

    if (!id) {
      // 创建
      create(parsedInput);
    } else {
      // 更新信息
      updateInfo(parsedInput);
    }
  };

  // 表单结构
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={id ? `编辑实例 #${id}` : '创建新实例'}
      size="xl"
    >
      <form onSubmit={infoForm.onSubmit(submitForm)}>
        <Flex direction="column" gap="sm">
          <TextInput label="名称" disabled={!isFormUnlocked} {...infoForm.getInputProps('name')} />

          <Textarea
            label="前置配置"
            disabled={!isFormUnlocked}
            autosize
            minRows={3}
            {...infoForm.getInputProps('pre_config')}
          />

          <Switch
            label="手动模式"
            disabled={!isFormUnlocked}
            {...infoForm.getInputProps('is_manual_mode', {
              type: 'checkbox',
            })}
          />

          <MultiSelect
            label="站点"
            disabled={!isFormUnlocked}
            data={siteList?.list.map((site) => ({
              label: site.name,
              value: site.id.toString(),
            }))}
            searchable
            hidePickedOptions
            {...infoForm.getInputProps('site_ids')}
          />

          <MultiSelect
            label="额外文件"
            disabled={!isFormUnlocked}
            data={additionalFileList?.list.map((file) => ({
              label: file.name,
              value: file.id.toString(),
            }))}
            searchable
            hidePickedOptions
            {...infoForm.getInputProps('additional_file_ids')}
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

export default InstanceModal;
