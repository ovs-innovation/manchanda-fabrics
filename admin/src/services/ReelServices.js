import requests from "./httpService";

const ReelServices = {
  getAllReels: async () => {
    return requests.get("/reels/admin/all");
  },

  createReel: async (body) => {
    return requests.post("/reels", body);
  },

  updateReel: async (id, body) => {
    return requests.put(`/reels/${id}`, body);
  },

  deleteReel: async (id) => {
    return requests.delete(`/reels/${id}`);
  },
};

export default ReelServices;
