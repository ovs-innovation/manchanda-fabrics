import requests from "./httpServices";

const CategoryServices = {
  getShowingCategory: async () => {
    const res = await requests.get("/category/show");
    const list = Array.isArray(res) ? res : [];
    return list.filter((c) => {
      const name = String(c?.name?.en || c?.name || "").toLowerCase().trim();
      const slug = String(c?.slug || "").toLowerCase().trim();
      return name !== "home" && slug !== "home" && c?.id !== "Root";
    });
  },
  getAllCategories: async () => {
    const res = await requests.get("/category/all");
    return Array.isArray(res) ? res : [];
  },
};

export default CategoryServices;
