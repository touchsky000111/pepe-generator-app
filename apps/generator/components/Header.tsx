'use client';

import {
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  AssignmentTurnedIn as FinalizeIcon,
  AutoAwesome as AutoAwesomeIcon,
  Backup as BackupIcon,
  ControlPointDuplicate as ControlPointDuplicateIcon,
  ElectricBolt as GenerateIcon,
  Menu as MenuIcon,
  Redo as RedoIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Undo as UndoIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Container,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import axios from 'axios';
import Link from 'next/link';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Menu as Nav } from '@/components/Menu/Menu';
import { BackupDialog } from '@/dialogs/BackupDialog';
import { CheckDuplicatesDialog } from '@/dialogs/CheckDuplicatesDialog';
import CloneExactDialog from '@/dialogs/CloneExactDialog';
import CloneSimilarDialog from '@/dialogs/CloneSimilarDialog';
import { FinalizeDialog } from '@/dialogs/FinalizeDialog';
import { GenerateDialog } from '@/dialogs/GenerateDialog';
import { RegenerateAllDialog } from '@/dialogs/RegenerateAllDialog';
import { useEditorStore } from '@/stores/editor';
import { usePepeStore } from '@/stores/pepe';
import CloneSimilarApprovedDialog from '@/dialogs/CloneSimilarApprovedDialog';
import CloneSimilarManyTraitsDialog from '@/dialogs/CloneSimilarManyTraitsDialog';

export const Header: FC = () => {
  const onlySmallScreen = useMediaQuery('(max-width: 600px)');
  const pathname = usePathname();
  const { push } = useRouter();

  const query = {
    id: pathname?.startsWith('/pepes') ? pathname.split('/').slice(-1)[0] : null,
  };

  const cloneButtonRef = useRef<HTMLButtonElement>(null);

  const pepes = usePepeStore((state) => state.pepes);
  const queryString = usePepeStore((state) => state.queryString);

  console.log(queryString);

  const selectedPepe = useEditorStore((state) => state.selectedPepe);
  const fetchPepe = useEditorStore((state) => state.fetchPepe);
  const redo = useEditorStore((state) => state.redo);
  const save = useEditorStore((state) => state.save);
  const undo = useEditorStore((state) => state.undo);

  const currentStep = useEditorStore((state) => state.currentStep);

  const isSaving = useEditorStore((state) => state.isSaving);

  const steps = useEditorStore((state) => state.steps);

  const [dialogType, setDialogType] = useState<
    | ''
    | 'backup'
    | 'check'
    | 'cloneExact'
    | 'cloneSimilar'
    | 'cloneSimilarApproved'
    | 'cloneSimilarManyTraits'
    | 'generate'
    | 'regenerate'
    | 'finalize'
  >('');
  const [pepeIndex, setPepeIndex] = useState(-1);
  const [isApproving, setIsApproving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCloneMenu, setShowCloneMenu] = useState(false);

  useHotkeys(
    'meta+m',
    () => {
      if (isSaving || isApproving) {
        return;
      }
      handleApproval();
    },
    { preventDefault: true },
  );
  useHotkeys('meta+\\', () => push(`/pepes/${pepes[pepeIndex - 1].id}${queryString}`), {
    preventDefault: true,
  });
  useHotkeys('meta+/', () => push(`/pepes/${pepes[pepeIndex + 1].id}${queryString}`), {
    preventDefault: true,
  });
  useHotkeys(
    'meta+s',
    () => {
      if (isSaving || isApproving || selectedPepe?.isApproved) {
        return;
      }

      save();
    },
    { preventDefault: true },
  );

  const handleApproval = async () => {
    if (!selectedPepe) {
      return;
    }

    setIsApproving(true);

    await axios({
      method: 'POST',
      url: '/api/toggleApproval',
      data: {
        id: selectedPepe.id,
        isApproved: !selectedPepe.isApproved,
      },
    });

    await fetchPepe(selectedPepe.id);

    setIsApproving(false);
  };

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (!event.metaKey || !['z', 'Z'].includes(event.key)) {
        return;
      }

      event.preventDefault();

      if (event.shiftKey && !isSaving && currentStep < steps.length - 1) {
        redo();
      } else if (!event.shiftKey && !isSaving && currentStep > 0) {
        undo();
      }
    },
    [currentStep, isSaving, redo, save, undo],
  );

  useEffect(() => {
    setShowMenu(false);
  }, [pathname]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [handleKey]);

  useEffect(() => {
    setPepeIndex(pepes.findIndex((pepe) => pepe.id === Number(query.id)));
  }, [query, pepes]);

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Stack alignItems="center" direction="row" justifyContent="space-between" width="100%">
              {onlySmallScreen && (
                <IconButton onClick={() => setShowMenu(true)}>
                  <MenuIcon />
                </IconButton>
              )}
              {(!onlySmallScreen || !!query.id) && (
                <>
                  <Stack alignItems="center" direction="row" gap={2}>
                    <Typography
                      component={Link}
                      href={`/${queryString}`}
                      noWrap
                      textTransform="uppercase"
                      variant="h6"
                    >
                      Pepe Generator
                    </Typography>
                  </Stack>
                  <Nav />
                </>
              )}
              {query.id && (
                <Stack alignItems="center" direction="row" gap={2}>
                  <Typography>
                    Pepe #{query.id}
                    {selectedPepe?.status === 'deleted' ? ' (Deleted)' : ''}
                    {selectedPepe?.originalPepeId && (
                      <Link
                        href={`/pepes/${selectedPepe.originalPepeId}`}
                        style={{ color: '#ce93d8' }}
                        target="_blank"
                      >
                        {' '}
                        (cloned from #{selectedPepe.originalPepeId})
                      </Link>
                    )}
                  </Typography>
                </Stack>
              )}
              <Drawer anchor="left" open={showMenu} onClose={() => setShowMenu(false)}>
                <Nav />
              </Drawer>
              <Stack direction="row" gap={1}>
                {!query.id ? (
                  <>
                    <Tooltip title="Clone">
                      <span>
                        <IconButton onClick={() => setShowCloneMenu(true)} ref={cloneButtonRef}>
                          <ControlPointDuplicateIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Menu
                      anchorEl={cloneButtonRef.current}
                      open={showCloneMenu}
                      onClose={() => setShowCloneMenu(false)}
                    >
                      <MenuItem
                        onClick={() => {
                          setDialogType('cloneSimilarApproved');
                          setShowCloneMenu(false);
                        }}
                      >
                        Clone Similar Approved Pepes
                      </MenuItem>
                    </Menu>
                    <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 2 }} />
                    {process.env.NEXT_PUBLIC_ENABLE_REGENERATION === 'true' && (
                      <Tooltip title="(Re)generate">
                        <IconButton onClick={() => setDialogType('regenerate')}>
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Check Duplicates">
                      <IconButton onClick={() => setDialogType('check')}>
                        <AutoAwesomeIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Generate More">
                      <IconButton onClick={() => setDialogType('generate')}>
                        <GenerateIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Backup">
                      <IconButton onClick={() => setDialogType('backup')}>
                        <BackupIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Finalize">
                      <IconButton onClick={() => setDialogType('finalize')}>
                        <FinalizeIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <>
                    <Tooltip title="Clone">
                      <span>
                        <IconButton
                          disabled={!selectedPepe || isSaving}
                          onClick={() => setShowCloneMenu(true)}
                          ref={cloneButtonRef}
                        >
                          <ControlPointDuplicateIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Menu
                      anchorEl={cloneButtonRef.current}
                      open={showCloneMenu}
                      onClose={() => setShowCloneMenu(false)}
                    >
                      <MenuItem
                        onClick={() => {
                          setDialogType('cloneExact');
                          setShowCloneMenu(false);
                        }}
                      >
                        Clone Exact Pepe
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setDialogType('cloneSimilar');
                          setShowCloneMenu(false);
                        }}
                      >
                        Clone Similar Pepe
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setDialogType('cloneSimilarManyTraits');
                          setShowCloneMenu(false);
                        }}
                      >
                        Clone Similar Pepe by Many Traits
                      </MenuItem>
                    </Menu>
                    <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 2 }} />
                    <Tooltip title="Undo">
                      <span>
                        <IconButton
                          disabled={selectedPepe?.isApproved || isSaving || currentStep <= 0}
                          onClick={undo}
                        >
                          <UndoIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Redo">
                      <span>
                        <IconButton
                          disabled={
                            selectedPepe?.isApproved || isSaving || currentStep >= steps.length - 1
                          }
                          onClick={redo}
                        >
                          <RedoIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title={selectedPepe?.isApproved ? 'Unapprove' : 'Approve'}>
                      <span>
                        <IconButton
                          disabled={!selectedPepe || isApproving || isSaving}
                          onClick={handleApproval}
                        >
                          {selectedPepe?.isApproved ? <ThumbDownIcon /> : <ThumbUpIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Save">
                      <span>
                        <IconButton
                          disabled={
                            !selectedPepe || isApproving || isSaving || selectedPepe?.isApproved
                          }
                          onClick={save}
                        >
                          <SaveIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Divider orientation="vertical" variant="middle" flexItem sx={{ mx: 2 }} />
                    <Tooltip title="Back">
                      <span>
                        <IconButton
                          disabled={!pepes[pepeIndex - 1]}
                          href={`/pepes/${pepes[pepeIndex - 1]?.id}${queryString}`}
                        >
                          <ArrowLeftIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Next">
                      <span>
                        <IconButton
                          disabled={!pepes[pepeIndex + 1]}
                          href={`/pepes/${pepes[pepeIndex + 1]?.id}${queryString}`}
                        >
                          <ArrowRightIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </>
                )}
              </Stack>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
      {dialogType === 'backup' && <BackupDialog onClose={() => setDialogType('')} />}
      {dialogType === 'check' && <CheckDuplicatesDialog onClose={() => setDialogType('')} />}
      {dialogType === 'cloneExact' && <CloneExactDialog onClose={() => setDialogType('')} />}
      {dialogType === 'cloneSimilar' && <CloneSimilarDialog onClose={() => setDialogType('')} />}
      {dialogType === 'cloneSimilarApproved' && (
        <CloneSimilarApprovedDialog onClose={() => setDialogType('')} />
      )}
      {dialogType === 'cloneSimilarManyTraits' && (
        <CloneSimilarManyTraitsDialog onClose={() => setDialogType('')} />
      )}
      {dialogType === 'generate' && <GenerateDialog onClose={() => setDialogType('')} />}
      {dialogType === 'regenerate' && <RegenerateAllDialog onClose={() => setDialogType('')} />}
      {dialogType === 'finalize' && <FinalizeDialog onClose={() => setDialogType('')} />}
    </>
  );
};
