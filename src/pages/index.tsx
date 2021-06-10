import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { AxiosResponse } from 'axios';

interface GetImagesDataItem {
  title: string;
  description: string;
  url: string;
  ts: number;
  id: string;
}

interface GetImages {
  after: string;
  data: GetImagesDataItem[];
}

export default function Home(): JSX.Element {
  const getImages = async ({
    pageParam = null,
  }): Promise<AxiosResponse<GetImages>> => {
    const response = await api.get('/api/images', {
      params: {
        after: pageParam,
      },
    });

    return response;
  };

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery('images', getImages, {
    getNextPageParam: (lastPage, pages) => lastPage.data.after,
  });

  const formattedData = useMemo(() => {
    if (data) {
      const newData = data.pages.map(page => {
        return page.data.data;
      });

      return newData.flat();
    }
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />
        {hasNextPage && (
          <Button
            type="button"
            mt="10"
            fontWeight="bold"
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? 'Carregando...' : 'Carregar mais'}
          </Button>
        )}
      </Box>
    </>
  );
}
