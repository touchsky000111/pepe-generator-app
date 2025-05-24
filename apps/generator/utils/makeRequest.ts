export interface CreateRequestProps {}

export default function makeRequest(body = {}, url = 'http://localhost:3000/') {
  return new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
