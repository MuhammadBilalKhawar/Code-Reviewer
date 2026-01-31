import axios from "axios";

export const githubApi = async (token, endpoint) => {
  const { data } = await axios.get(`https://api.github.com${endpoint}`, {
    headers: { Authorization: `token ${token}` },
  });
  return data;
};
