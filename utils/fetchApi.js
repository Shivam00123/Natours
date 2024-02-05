export const get_fetchAPI = async (endpoint) => {
  const response = await fetch(`http://localhost:3001/api/v1/${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());
  return response;
};

export const patch_fetchAPI = async (endpoint, body) => {
  const response = await fetch(`http://localhost:3001/api/v1/${endpoint}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  return response;
};

export const post_fetchAPI = async (endpoint, body) => {
  const response = await fetch(`http://localhost:3001/api/v1/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  return response;
};
