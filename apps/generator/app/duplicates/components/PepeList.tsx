'use client';

import { shuffleArray } from '@/utils/shuffleArray';
import { OpenInBrowser } from '@mui/icons-material';
import { Button, Chip, CircularProgress, IconButton } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Image from 'next/image';

export default function PepeList() {
  const [duplicateIndex, setDuplicateIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [skipped, setSkipped] = useState(1);

  const getDuplicates = useQuery({
    queryKey: ['duplicates'],
    queryFn: async () => {
      const res = await axios({
        method: 'POST',
        url: '/api/getDuplicates',
      });

      const data = res.data as {
        duplicates: Array<{
          hash: string;
          pepeIds: number[];
        }>;
      };

      return shuffleArray(data.duplicates);
    },
  });

  const pepes = useQuery({
    queryKey: ['pepes', getDuplicates, duplicateIndex],
    queryFn: async () => {
      if (!getDuplicates.data || !getDuplicates.data[duplicateIndex]) {
        return [];
      }

      const duplicate = getDuplicates.data[duplicateIndex];

      if (duplicate.pepeIds.length > 10) {
        return [];
      }

      const results = await Promise.all(
        duplicate.pepeIds.map(async (pepeId) => {
          const res = await axios({
            method: 'POST',
            url: '/api/getPepe',
            data: {
              id: pepeId,
            },
          });

          return res.data as {
            pepe: {
              id: number;
              imageUrl?: string | null;
              isApproved?: boolean;
              status?: string;
              traits: Array<{
                id: number;
                file: string;
                folder: string;
                imageUrl?: string;
              }>;
            };
          };
        }),
      );

      return results.map((result) => result.pepe);
    },
  });

  const handleSave = async () => {
    if (isSaving || !selectedId || !pepes.data) {
      return;
    }

    setIsSaving(true);

    const rejectedPepeIds = pepes.data
      .filter((pepe) => pepe.id !== selectedId)
      .map((pepe) => pepe.id);

    await Promise.all([
      axios({
        method: 'POST',
        url: '/api/deleteManyPepes',
        data: {
          ids: rejectedPepeIds,
        },
      }),
      axios({
        method: 'POST',
        url: '/api/toggleApprovalMany',
        data: {
          ids: rejectedPepeIds,
          isApproved: false,
        },
      }),
      axios({
        method: 'POST',
        url: '/api/toggleApproval',
        data: {
          id: selectedId,
          isApproved: true,
        },
      }),
    ]);

    setIsSaving(false);
    setSelectedId(0);

    setDuplicateIndex(duplicateIndex + 1);
  };

  const handleSkip = () => {
    setDuplicateIndex(duplicateIndex + 1);
    setSkipped(skipped + 1);
  };

  useHotkeys('meta+s', handleSave);
  useHotkeys('meta+k', handleSkip);

  if (getDuplicates.isPending || pepes.isPending) {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          listStyle: 'none',
          margin: 0,
//          minHeight: 'calc(100vh - 64px)',
          padding: '20px 20px 80px 20px',
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (!getDuplicates.data || !pepes.data) {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          listStyle: 'none',
          margin: 0,
//          minHeight: 'calc(100vh - 64px)',
          padding: '20px 20px 80px 20px',
        }}
      >
        Error
      </div>
    );
  }

  return (
    <>
      <ul
        style={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          listStyle: 'none',
          margin: 0,
//          minHeight: 'calc(100vh - 64px)',
          padding: '20px 20px 80px 20px',
        }}
      >
        {pepes.data.length === 0 && (
          <div>Problem loading this set of duplicates. Please skip or try again.</div>
        )}
        {pepes.data.map((pepe) => (
          <li
            key={pepe.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <button
              onClick={() => {
                if (selectedId === pepe.id) {
                  setSelectedId(0);
                } else {
                  setSelectedId(pepe.id);
                }
              }}
              style={{
                border: selectedId === pepe.id ? '5px red solid' : '5px black solid',
                cursor: 'pointer',
                margin: 0,
                opacity: selectedId && selectedId !== pepe.id ? '.25' : 1,
                padding: 0,
                position: 'relative',
              }}
            >
              <img
                src={`/images/blank.png`}
                style={{
                  display: 'block',
                }}
              />
              {pepe.imageUrl ? (
                <img src={pepe.imageUrl} style={{ position: 'absolute', top: 0, left: 0 }} />
              ) : (
                pepe.traits.map((trait) => (
                  <img
                    key={trait.id}
                    src={
                      trait.imageUrl
                        ? trait.imageUrl
                        : `/images/traits/${trait.folder}/${trait.file}`
                    }
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  />
                ))
              )}
              <div style={{ display: 'flex', gap: 5, position: 'absolute', right: 10, top: 10 }}>
                {pepe.status === 'deleted' && <Chip color="error" label="Deleted" />}
                {pepe.isApproved && <Chip color="success" label="Approved" />}
              </div>
            </button>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'center' }}
            >
              Pepe #{pepe.id}
              <IconButton href={`/pepes/${pepe.id}`} target="_blank">
                <OpenInBrowser />
              </IconButton>
            </div>
          </li>
        ))}
      </ul>
      <div style={{ display: 'flex', gap: 20, position: 'fixed', right: 20, bottom: 20 }}>
        <Button onClick={handleSkip}>Skip</Button>
        <Button disabled={!selectedId || isSaving} onClick={handleSave}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
      <div style={{ position: 'fixed', left: 20, bottom: 20 }}>
        {getDuplicates.data.length - duplicateIndex + skipped} duplicates
      </div>
    </>
  );
}
