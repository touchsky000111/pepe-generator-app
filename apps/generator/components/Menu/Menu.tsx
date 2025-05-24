import { Stack, Typography, useMediaQuery } from '@mui/material';
import classNames from 'classnames';
import Link from 'next/link';
import { FC } from 'react';

import styles from './Menu.module.scss';
import { usePathname } from 'next/navigation';
import { usePepeStore } from '@/stores/pepe';

export const Menu: FC = () => {
  const onlySmallScreen = useMediaQuery('(max-width: 600px)');
  const pathname = usePathname();

  const queryString = usePepeStore((state) => state.queryString);

  const query = {
    id: pathname?.startsWith('/pepes') ? pathname.split('/').slice(-1)[0] : null,
  };

  if (query.id) {
    return null;
  }

  return (
    <>
      {onlySmallScreen && (
        <Typography component="h1" m={2} variant="h4">
          Pepe Generator
        </Typography>
      )}
      <nav>
        <Stack
          component="ul"
          direction={onlySmallScreen ? 'column' : 'row'}
          gap={2}
          sx={{ listStyle: 'none' }}
        >
          <li
            className={classNames(styles.listItem, {
              [styles.selected]: pathname === '/' || pathname?.startsWith('/pepes/'),
            })}
          >
            <Link href={`/${queryString}`}>
              <Typography fontSize="1rem">Pepes</Typography>
            </Link>
          </li>
          <li
            className={classNames(styles.listItem, {
              [styles.selected]: pathname === '/approved',
            })}
          >
            <Link href={`/approved${queryString}`}>
              <Typography fontSize="1rem">Approved</Typography>
            </Link>
          </li>
          <li
            className={classNames(styles.listItem, {
              [styles.selected]: pathname === '/duplicates',
            })}
          >
            <Link href={`/duplicates${queryString}`}>
              <Typography fontSize="1rem">Duplicates</Typography>
            </Link>
          </li>
          <li
            className={classNames(styles.listItem, {
              [styles.selected]: pathname === '/traits',
            })}
          >
            <Link href={`/traits${queryString}`}>
              <Typography fontSize="1rem">Traits</Typography>
            </Link>
          </li>
        </Stack>
      </nav>
    </>
  );
};
