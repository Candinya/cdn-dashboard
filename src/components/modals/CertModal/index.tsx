import { useEffect, useState } from 'react';
import { IconDeviceFloppy, IconPencil } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import {
  Button,
  Checkbox,
  Code,
  Collapse,
  Flex,
  Group,
  JsonInput,
  Modal,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import API from '@/api';
import type { CertInfoInput } from '@/api/cert';
import { authTokenAtom } from '@/atoms/authToken';

interface CertModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number | null; // null 表示创建新的
}
const CertModal = ({ isOpen, onClose, id }: CertModalProps) => {
  // 状态管理
  const authToken = useAtomValue(authTokenAtom);

  // 详细信息拉取请求
  const { data: info } = useQuery({
    queryKey: ['cert', 'info', id],
    queryFn: async () => {
      if (id) {
        return await API.CertAPI.GetCertInfo(authToken!, id);
      } else {
        return null;
      }
    },
  });

  const queryClient = useQueryClient();

  const emptyInfo = {
    name: '',
    is_manual_mode: false,

    // 模式 1 ：通过提供者参数自动申请管理
    domains: [],
    provider: '',

    // 模式 2 ：直接上传证书信息
    certificate: '',
    private_key: '',
    intermediate_certificate: '',
    csr: '',
  };

  // 主表单
  const infoForm = useForm<CertInfoInput>({
    mode: 'uncontrolled',
    initialValues: emptyInfo,
  });

  const [isManualMode, setIsManualMode] = useState(false);
  const [isManualModeHaveExtendInfo, setIsManualModeHaveExtendInfo] = useState(false);

  // 当信息变更时的操作
  useEffect(() => {
    if (isOpen) {
      if (info) {
        infoForm.setInitialValues(info);

        setIsManualMode(info.is_manual_mode);
        setIsManualModeHaveExtendInfo(!!info.intermediate_certificate || !!info.csr);
      } else {
        infoForm.setInitialValues(emptyInfo);

        setIsManualMode(false);
        setIsManualModeHaveExtendInfo(false);
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
    mutationKey: ['cert', 'update', id, 'info'],
    mutationFn: (input: CertInfoInput) => {
      // 更新，那么只需要更新 input
      return API.CertAPI.UpdateCertInfo(authToken!, id!, input);
    },
    onSuccess: (newInfo) => {
      queryClient.invalidateQueries({
        queryKey: ['cert', 'info', newInfo.id],
      });
      notifications.show({
        color: 'green',
        title: '证书信息更新成功',
        message: (
          <Text size="xs">
            证书 <Code>{newInfo.name}</Code> 信息更新成功
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '证书信息更新失败',
        message: e.message,
      });
    },
  });

  // 提交主表单：创建
  const { isPending: isCreating, mutate: create } = useMutation({
    mutationKey: ['cert', 'create'],
    mutationFn: (input: CertInfoInput) => {
      return API.CertAPI.CreateCert(authToken!, input);
    },
    onSuccess: (newInfo) => {
      notifications.show({
        color: 'green',
        title: '证书创建成功',
        message: (
          <Text size="xs">
            成功创建了名为 <Code>{newInfo.name}</Code> 的证书 (#{newInfo.id})
          </Text>
        ),
      });
      onClose();
    },
    onError: (e) => {
      notifications.show({
        color: 'red',
        title: '证书创建失败',
        message: e.message,
      });
    },
  });

  const submitForm = (input: CertInfoInput) => {
    const parsedValue: CertInfoInput = {
      name: input.name,
      is_manual_mode: isManualMode,

      domains: isManualMode ? [] : input.domains, // 空字符串，等待解析证书
      provider: isManualMode ? null : input.provider,

      certificate: isManualMode ? input.certificate : null,
      private_key: isManualMode ? input.private_key : null,
      intermediate_certificate: isManualMode ? input.intermediate_certificate : null,
      csr: isManualMode ? input.csr : null,
    };
    if (!id) {
      // 创建
      create(parsedValue);
    } else {
      // 更新信息
      updateInfo(parsedValue);
    }
  };

  // 表单结构
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={id ? `编辑证书 #${id}` : '创建新证书'}
      size="xl"
    >
      <form onSubmit={infoForm.onSubmit(submitForm)}>
        <Flex direction="column" gap="sm">
          <TextInput label="名称" disabled={!isFormUnlocked} {...infoForm.getInputProps('name')} />

          <Switch
            label="模式选择"
            size="lg"
            onLabel="手动"
            offLabel="自动"
            checked={isManualMode}
            onChange={(ev) => setIsManualMode(ev.target.checked)}
            disabled={!isFormUnlocked}
          />

          {isManualMode ? (
            <>
              <Textarea
                label="证书"
                disabled={!isFormUnlocked}
                minRows={3}
                placeholder={'-----BEGIN CERTIFICATE-----\n......\n-----END CERTIFICATE-----'}
                autosize
                {...infoForm.getInputProps('certificate')}
              />
              <Textarea
                label="私钥"
                disabled={!isFormUnlocked}
                minRows={3}
                placeholder={'-----BEGIN PRIVATE KEY-----\n......\n-----END PRIVATE KEY-----'}
                autosize
                {...infoForm.getInputProps('private_key')}
              />

              <Checkbox
                label="包含扩展信息"
                checked={isManualModeHaveExtendInfo}
                onChange={(ev) => setIsManualModeHaveExtendInfo(ev.target.checked)}
                disabled={!isFormUnlocked}
              />

              <Collapse in={isManualModeHaveExtendInfo}>
                <Group grow>
                  <Textarea
                    label="中间证书"
                    disabled={!isFormUnlocked}
                    minRows={3}
                    autosize
                    {...infoForm.getInputProps('intermediate_certificate')}
                  />
                  <Textarea
                    label="CSR"
                    disabled={!isFormUnlocked}
                    minRows={3}
                    autosize
                    {...infoForm.getInputProps('csr')}
                  />
                </Group>
              </Collapse>
            </>
          ) : (
            <>
              <TagsInput
                label="域名"
                disabled={!isFormUnlocked}
                {...infoForm.getInputProps('domains')}
              />
              <JsonInput
                label="提供者选项"
                disabled={!isFormUnlocked}
                minRows={5}
                autosize
                formatOnBlur
                validationError="无效的 JSON"
                {...infoForm.getInputProps('provider')}
              />
            </>
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

export default CertModal;
