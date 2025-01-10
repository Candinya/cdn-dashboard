import { useEffect, useState } from 'react';
import { IconDeviceFloppy, IconPencil } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import {
  Button,
  Code,
  Fieldset,
  Flex,
  Group,
  Modal,
  Select,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import type { SiteInfoInput } from '@/api/site';
import { authTokenAtom } from '@/atoms/authToken';

interface SiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null; // null 表示创建新的
}
const SiteModal = ({ isOpen, onClose, id }: SiteModalProps) => {
  // 状态管理
  const authToken = useAtomValue(authTokenAtom);

  // 详细信息拉取请求
  const { data: siteInfo } = useQuery({
    queryKey: ['site', 'info', id],
    queryFn: async () => {
      if (id) {
        return await API.SiteAPI.GetSiteInfo(authToken!, id);
      } else {
        return null;
      }
    },
  });

  const { isPending: isLoadingCertList, data: certList } = useQuery({
    queryKey: ['cert', 'list', 1],
    queryFn: () => API.CertAPI.GetCertList(authToken!, 1, 100), // 这样不好，最好能找到一个合适的办法（这里没有考虑超过 100 张证书的情况）
  });

  const { isPending: isLoadingTemplateList, data: templateList } = useQuery({
    queryKey: ['template', 'list', 1],
    queryFn: () => API.TemplateAPI.GetTemplateList(authToken!, 1, 100), // 同上
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const { data: templateInfo } = useQuery({
    queryKey: ['template', 'info', selectedTemplateId],
    queryFn: async () => {
      if (selectedTemplateId) {
        return await API.TemplateAPI.GetTemplateInfo(authToken!, selectedTemplateId);
      } else {
        return null;
      }
    },
  });

  const queryClient = useQueryClient();

  const emptyInfo: Omit<SiteInfoInput, 'cert_id' | 'template_id'> & {
    cert_id: string | null;
    template_id: string;
  } = {
    name: '',
    origin: '',
    cert_id: '', // select 不能使用 number 作为 value ，所以只能使用 string ，在提交的时候转换成 number
    template_id: '', // 同上
    template_values: [],
  };

  // 主表单
  const siteInfoForm = useForm({
    mode: 'controlled', // 加载值需要一定时间，编辑模式下可能导致值无法正常加载，暂时没想到更好的方法就先用 controlled 状态了
    initialValues: emptyInfo,
    onValuesChange: (nv, ov) => {
      if (nv.template_id !== ov.template_id) {
        // 模板 ID 变化了
        setSelectedTemplateId(parseInt(nv.template_id));
      }
    },
  });

  // 当信息变更时的操作
  useEffect(() => {
    if (isOpen) {
      if (siteInfo) {
        siteInfoForm.setInitialValues({
          ...siteInfo,
          cert_id: siteInfo.cert_id?.toString() || null,
          template_id: siteInfo.template_id.toString(),
        });
      } else {
        siteInfoForm.setInitialValues(emptyInfo);
      }
      siteInfoForm.reset();
    }
  }, [siteInfo, isOpen]);

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
    mutationKey: ['site', 'update', id, 'info'],
    mutationFn: (input: SiteInfoInput) => {
      // 更新，那么只需要更新 input
      return API.SiteAPI.UpdateSiteInfo(authToken!, id!, input);
    },
    onSuccess: (newInfo) => {
      queryClient.invalidateQueries({
        queryKey: ['site', 'info', newInfo.id],
      });
      notifications.show({
        color: 'green',
        title: '站点信息更新成功',
        message: (
          <Text size="xs">
            站点 <Code>{newInfo.name}</Code> 信息更新成功
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '站点信息更新失败',
        message: e.message,
      });
    },
  });

  // 提交主表单：创建
  const { isPending: isCreating, mutate: create } = useMutation({
    mutationKey: ['site', 'create'],
    mutationFn: (input: SiteInfoInput) => {
      return API.SiteAPI.CreateSite(authToken!, input);
    },
    onSuccess: (newInfo) => {
      notifications.show({
        color: 'green',
        title: '站点创建成功',
        message: (
          <Text size="xs">
            成功创建了名为 <Code>{newInfo.name}</Code> 的站点 (#{newInfo.id})
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '站点创建失败',
        message: e.message,
      });
    },
  });

  const submitForm = (input: typeof emptyInfo) => {
    const parsedInput: SiteInfoInput = {
      ...input,
      cert_id: input.cert_id ? parseInt(input.cert_id) : null,
      template_id: parseInt(input.template_id),
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
      title={id ? `编辑站点 #${id}` : '创建新站点'}
      size="xl"
    >
      <form onSubmit={siteInfoForm.onSubmit(submitForm)}>
        <Flex direction="column" gap="sm">
          <TextInput
            label="名称"
            disabled={!isFormUnlocked}
            {...siteInfoForm.getInputProps('name')}
          />

          <TextInput
            label="源"
            disabled={!isFormUnlocked}
            {...siteInfoForm.getInputProps('origin')}
          />

          <Select
            label="证书"
            disabled={!isFormUnlocked || isLoadingCertList}
            data={
              certList?.list.map((cert) => ({
                value: cert.id.toString(),
                label: cert.name,
              })) || []
            }
            {...siteInfoForm.getInputProps('cert_id')}
          />

          <Select
            label="模板"
            disabled={!isFormUnlocked || isLoadingTemplateList}
            data={
              templateList?.list.map((template) => ({
                value: template.id.toString(),
                label: template.name,
              })) || []
            }
            allowDeselect={false}
            {...siteInfoForm.getInputProps('template_id')}
          />

          {templateInfo && (
            <Fieldset legend="模板与变量">
              <Code block>{templateInfo.content}</Code>

              {templateInfo.variables.map((variable, index) => (
                <Textarea
                  key={`${templateInfo.id}-${index}`}
                  label={variable}
                  disabled={!isFormUnlocked || isLoadingTemplateList}
                  autosize
                  {...siteInfoForm.getInputProps(`template_values.${index}`)}
                />
              ))}
            </Fieldset>
          )}

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

export default SiteModal;
