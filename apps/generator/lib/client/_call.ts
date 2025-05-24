import axios from 'axios';

export type Call = <T>(method: string, data: any) => Promise<T>;

export const call: Call = async (method, data) => {
  const res = await axios({
    method: 'POST',
    headers:
      typeof localStorage !== 'undefined' && localStorage.getItem('accessToken')
        ? {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          }
        : {},
    url: `/api${method}`,
    data: data || {},
  });

  return res.data;
};

export const callForm: Call = async (method, data) => {
  const formData = new FormData();
  formData.append('id', data.id);
  formData.append('file', data.file);
  formData.append('thumbnail', data.thumbnail);
  formData.append('type', data.type);

  const res = await axios.postForm(`/api${method}`, formData, {
    headers:
      typeof localStorage !== 'undefined' && localStorage.getItem('accessToken')
        ? {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data',
          }
        : {
            'Content-Type': 'multipart/form-data',
          },
  });

  return res.data;
};
