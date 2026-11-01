import type { default as _DeleteKegiatanEp } from '../src/api/deleteKegiatan';
import type { default as _DeleteRiwayatEp } from '../src/api/deleteRiwayat';
import type { default as _GenerateDeskripsiEp } from '../src/api/generateDeskripsi';
import type { default as _GeneratePdfHarianEp } from '../src/api/generatePdfHarian';
import type { default as _GeneratePdfRhkEp } from '../src/api/generatePdfRhk';
import type { default as _GetKegiatanEp } from '../src/api/getKegiatan';
import type { default as _GetRiwayatEp } from '../src/api/getRiwayat';
import type { default as _PreviewHarianEp } from '../src/api/previewHarian';
import type { default as _PreviewRhkEp } from '../src/api/previewRhk';
import type { default as _SaveBulkKegiatanEp } from '../src/api/saveBulkKegiatan';
import type { default as _SaveKegiatanEp } from '../src/api/saveKegiatan';
import type { default as _UpdateRiwayatEp } from '../src/api/updateRiwayat';

import deleteKegiatanEp from '../src/api/deleteKegiatan';
import deleteRiwayatEp from '../src/api/deleteRiwayat';
import generateDeskripsiEp from '../src/api/generateDeskripsi';
import generatePdfHarianEp from '../src/api/generatePdfHarian';
import generatePdfRhkEp from '../src/api/generatePdfRhk';
import getKegiatanEp from '../src/api/getKegiatan';
import getRiwayatEp from '../src/api/getRiwayat';
import previewHarianEp from '../src/api/previewHarian';
import previewRhkEp from '../src/api/previewRhk';
import saveBulkKegiatanEp from '../src/api/saveBulkKegiatan';
import saveKegiatanEp from '../src/api/saveKegiatan';
import updateRiwayatEp from '../src/api/updateRiwayat';

type _DeleteKegiatanCfg = typeof _DeleteKegiatanEp;
export type DeleteKegiatanInputType = NonNullable<_DeleteKegiatanCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_DeleteKegiatanCfg['execute']>[0]['input'];
export type DeleteKegiatanOutputType = Awaited<ReturnType<_DeleteKegiatanCfg['execute']>>;

type _DeleteRiwayatCfg = typeof _DeleteRiwayatEp;
export type DeleteRiwayatInputType = NonNullable<_DeleteRiwayatCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_DeleteRiwayatCfg['execute']>[0]['input'];
export type DeleteRiwayatOutputType = Awaited<ReturnType<_DeleteRiwayatCfg['execute']>>;

type _GenerateDeskripsiCfg = typeof _GenerateDeskripsiEp;
export type GenerateDeskripsiInputType = NonNullable<_GenerateDeskripsiCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_GenerateDeskripsiCfg['execute']>[0]['input'];
export type GenerateDeskripsiOutputType = Awaited<ReturnType<_GenerateDeskripsiCfg['execute']>>;

type _GeneratePdfHarianCfg = typeof _GeneratePdfHarianEp;
export type GeneratePdfHarianInputType = NonNullable<_GeneratePdfHarianCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_GeneratePdfHarianCfg['execute']>[0]['input'];
export type GeneratePdfHarianOutputType = Awaited<ReturnType<_GeneratePdfHarianCfg['execute']>>;

type _GeneratePdfRhkCfg = typeof _GeneratePdfRhkEp;
export type GeneratePdfRhkInputType = NonNullable<_GeneratePdfRhkCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_GeneratePdfRhkCfg['execute']>[0]['input'];
export type GeneratePdfRhkOutputType = Awaited<ReturnType<_GeneratePdfRhkCfg['execute']>>;

type _GetKegiatanCfg = typeof _GetKegiatanEp;
export type GetKegiatanInputType = NonNullable<_GetKegiatanCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_GetKegiatanCfg['execute']>[0]['input'];
export type GetKegiatanOutputType = Awaited<ReturnType<_GetKegiatanCfg['execute']>>;

type _GetRiwayatCfg = typeof _GetRiwayatEp;
export type GetRiwayatInputType = NonNullable<_GetRiwayatCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_GetRiwayatCfg['execute']>[0]['input'];
export type GetRiwayatOutputType = Awaited<ReturnType<_GetRiwayatCfg['execute']>>;

type _PreviewHarianCfg = typeof _PreviewHarianEp;
export type PreviewHarianInputType = NonNullable<_PreviewHarianCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_PreviewHarianCfg['execute']>[0]['input'];
export type PreviewHarianOutputType = Awaited<ReturnType<_PreviewHarianCfg['execute']>>;

type _PreviewRhkCfg = typeof _PreviewRhkEp;
export type PreviewRhkInputType = NonNullable<_PreviewRhkCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_PreviewRhkCfg['execute']>[0]['input'];
export type PreviewRhkOutputType = Awaited<ReturnType<_PreviewRhkCfg['execute']>>;

type _SaveBulkKegiatanCfg = typeof _SaveBulkKegiatanEp;
export type SaveBulkKegiatanInputType = NonNullable<_SaveBulkKegiatanCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_SaveBulkKegiatanCfg['execute']>[0]['input'];
export type SaveBulkKegiatanOutputType = Awaited<ReturnType<_SaveBulkKegiatanCfg['execute']>>;

type _SaveKegiatanCfg = typeof _SaveKegiatanEp;
export type SaveKegiatanInputType = NonNullable<_SaveKegiatanCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_SaveKegiatanCfg['execute']>[0]['input'];
export type SaveKegiatanOutputType = Awaited<ReturnType<_SaveKegiatanCfg['execute']>>;

type _UpdateRiwayatCfg = typeof _UpdateRiwayatEp;
export type UpdateRiwayatInputType = NonNullable<_UpdateRiwayatCfg['inputSchema']> extends { _input: infer I } ? I : Parameters<_UpdateRiwayatCfg['execute']>[0]['input'];
export type UpdateRiwayatOutputType = Awaited<ReturnType<_UpdateRiwayatCfg['execute']>>;

export const deleteKegiatan = async (input: DeleteKegiatanInputType): Promise<DeleteKegiatanOutputType> => {
  return await (deleteKegiatanEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const deleteRiwayat = async (input: DeleteRiwayatInputType): Promise<DeleteRiwayatOutputType> => {
  return await (deleteRiwayatEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const generateDeskripsi = async (input: GenerateDeskripsiInputType): Promise<GenerateDeskripsiOutputType> => {
  return await (generateDeskripsiEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const generatePdfHarian = async (input: GeneratePdfHarianInputType): Promise<GeneratePdfHarianOutputType> => {
  return await (generatePdfHarianEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const generatePdfRhk = async (input: GeneratePdfRhkInputType): Promise<GeneratePdfRhkOutputType> => {
  return await (generatePdfRhkEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const getKegiatan = async (input: GetKegiatanInputType): Promise<GetKegiatanOutputType> => {
  return await (getKegiatanEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const getRiwayat = async (input: GetRiwayatInputType): Promise<GetRiwayatOutputType> => {
  return await (getRiwayatEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const previewHarian = async (input: PreviewHarianInputType): Promise<PreviewHarianOutputType> => {
  return await (previewHarianEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const previewRhk = async (input: PreviewRhkInputType): Promise<PreviewRhkOutputType> => {
  return await (previewRhkEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const saveBulkKegiatan = async (input: SaveBulkKegiatanInputType): Promise<SaveBulkKegiatanOutputType> => {
  return await (saveBulkKegiatanEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const saveKegiatan = async (input: SaveKegiatanInputType): Promise<SaveKegiatanOutputType> => {
  return await (saveKegiatanEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const updateRiwayat = async (input: UpdateRiwayatInputType): Promise<UpdateRiwayatOutputType> => {
  return await (updateRiwayatEp as any).execute({ input, step: {} as any, context: {} as any });
};

export const api = {
  deleteKegiatan,
  deleteRiwayat,
  generateDeskripsi,
  generatePdfHarian,
  generatePdfRhk,
  getKegiatan,
  getRiwayat,
  previewHarian,
  previewRhk,
  saveBulkKegiatan,
  saveKegiatan,
  updateRiwayat,
};
