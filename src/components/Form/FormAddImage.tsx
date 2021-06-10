import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface addImageFormData {
  title: string;
  description: string;
  image: FileList;
}

interface FormAddImageProps {
  closeModal: () => void;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: 'Arquivo obrigatório',
      validate: {
        lessThan10MB: (imgFile: File) => imgFile[0].size / 1024 / 1024 < 10 || 'O arquivo deve ser menor que 10MB',
        acceptedFormats: (imgFile: File) => !!imgFile[0].type.match(/image\/jpeg|image\/png|image\/gif/) || 'Somente são aceitos arquivos PNG, JPEG e GIF'
      }
    },
    title: {
      required: 'Título obrigatório',
      minLength: {
        value: 2,
        message: 'Mínimo de 2 caracteres',
      },
      maxLength: {
        value: 20,
        message: 'Máximo de 20 caracteres',
      }
    },
    description: {
      required: 'Descrição obrigatória',
      maxLength: {
        value: 65,
        message: 'Máximo de 65 caracteres',
      }
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async ({ title, description }: addImageFormData) => {
      await api.post('images', {
        url: imageUrl,
        title,
        description,
      })
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries('images')
      }
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState,
    setError,
    trigger,
  } = useForm();
  const { errors } = formState;

  const onSubmit: SubmitHandler<addImageFormData> = async (data)=> {
    try {
      if (!imageUrl) {
        toast({
          title: "Imagem não adicionada",
          description: "É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })

        return
      }

      await mutation.mutateAsync(data)

      toast({
        title: "Imagem cadastrada",
        description: "Sua imagem foi cadastrada com sucesso.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch {
      toast({
        title: "Falha no cadastro",
        description: "Ocorreu um erro ao tentar cadastrar a sua imagem.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      reset()
      setImageUrl('')
      setLocalImageUrl('')
      closeModal()
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          name="image"
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          {...register("image", formValidations.image)}
        />

        <TextInput
          name="title"
          placeholder="Título da imagem..."
          error={errors.title}
          {...register("title", formValidations.title)}
        />

        <TextInput
          name="description"
          placeholder="Descrição da imagem..."
          error={errors.description}
          {...register("description", formValidations.description)}
        />
      </Stack>

      <Button
        my={6}
        isLoading={formState.isSubmitting}
        isDisabled={formState.isSubmitting}
        type="submit"
        w="100%"
        py={6}
      >
        Enviar
      </Button>
    </Box>
  );
}
