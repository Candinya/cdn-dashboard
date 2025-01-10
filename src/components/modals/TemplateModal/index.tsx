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
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import type { TemplateInfoInput } from '@/api/template';
import { authTokenAtom } from '@/atoms/authToken';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null; // null 表示创建新的
}
const TemplateModal = ({ isOpen, onClose, id }: TemplateModalProps) => {
  // 状态管理
  const authToken = useAtomValue(authTokenAtom);

  // 详细信息拉取请求
  const { data: templateInfo } = useQuery({
    queryKey: ['template', 'info', id],
    queryFn: async () => {
      if (id) {
        return await API.TemplateAPI.GetTemplateInfo(authToken!, id);
      } else {
        return null;
      }
    },
  });

  const queryClient = useQueryClient();

  const emptyTemplateInfo = {
    name: '',
    description: '',
    content: '',
    variables: [],
  };

  // 主表单
  const templateInfoForm = useForm<TemplateInfoInput>({
    mode: 'controlled', // 加载值需要一定时间，编辑模式下可能导致 variables 的值无法正常加载，暂时没想到更好的方法就先用 controlled 状态了
    initialValues: emptyTemplateInfo,
  });

  // 当信息变更时的操作
  useEffect(() => {
    if (isOpen) {
      if (templateInfo) {
        templateInfoForm.setInitialValues(templateInfo);
      } else {
        templateInfoForm.setInitialValues(emptyTemplateInfo);
      }
      templateInfoForm.reset();
    }
  }, [templateInfo, isOpen]);

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
    mutationKey: ['template', 'update', id, 'info'],
    mutationFn: (input: TemplateInfoInput) => {
      // 更新，那么只需要更新 input
      return API.TemplateAPI.UpdateTemplateInfo(authToken!, id!, input);
    },
    onSuccess: (newTemplateInfo) => {
      queryClient.invalidateQueries({
        queryKey: ['template', 'info', newTemplateInfo.id],
      });
      notifications.show({
        color: 'green',
        title: '模板信息更新成功',
        message: (
          <Text size="xs">
            模板 <Code>{newTemplateInfo.name}</Code> 信息更新成功
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '模板信息更新失败',
        message: e.message,
      });
    },
  });

  // 提交主表单：创建
  const { isPending: isCreating, mutate: create } = useMutation({
    mutationKey: ['template', 'create'],
    mutationFn: (input: TemplateInfoInput) => {
      return API.TemplateAPI.CreateTemplate(authToken!, input);
    },
    onSuccess: (newTemplateInfo) => {
      notifications.show({
        color: 'green',
        title: '模板创建成功',
        message: (
          <Text size="xs">
            成功创建了名为 <Code>{newTemplateInfo.name}</Code> 的模板 (#{newTemplateInfo.id})
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '模板创建失败',
        message: e.message,
      });
    },
  });

  const submitForm = (input: TemplateInfoInput) => {
    if (!id) {
      // 创建
      create(input);
    } else {
      // 更新信息
      updateInfo(input);
    }
  };

  // 表单结构
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={id ? `编辑模板 #${id}` : '创建新模板'}
      size="xl"
    >
      <form onSubmit={templateInfoForm.onSubmit(submitForm)}>
        <Flex direction="column" gap="sm">
          <TextInput
            label="名称"
            disabled={!isFormUnlocked}
            {...templateInfoForm.getInputProps('name')}
          />
          <Textarea
            label="描述"
            disabled={!isFormUnlocked}
            autosize
            {...templateInfoForm.getInputProps('description')}
          />
          <Textarea
            label="内容"
            disabled={!isFormUnlocked}
            minRows={3}
            placeholder={'{{.Origin}} {\n    {{.Cert}}\n    reverse_proxy {{.Source}}\n}'}
            autosize
            {...templateInfoForm.getInputProps('content')}
          />
          <TagsInput
            label="变量名"
            disabled={!isFormUnlocked}
            {...templateInfoForm.getInputProps('variables')}
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

export default TemplateModal;
