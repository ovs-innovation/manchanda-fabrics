const Category = require("../models/Category");
const {
  ensureHindiName,
  ensureHindiDescription,
} = require("../utils/fashionTranslator");

const slugify = (text) => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getCategoryRawName = (nameObj) => {
  if (!nameObj) return "";
  if (typeof nameObj === "string") return nameObj;
  return nameObj.en || nameObj.default || Object.values(nameObj)[0] || "";
};

const addCategory = async (req, res) => {
  try {
    if (req.body.name) {
      req.body.name = ensureHindiName(req.body.name);
    }
    if (req.body.description) {
      req.body.description = ensureHindiDescription(req.body.description);
    }
    const rawName = getCategoryRawName(req.body.name);
    if (!req.body.slug && rawName) {
      req.body.slug = slugify(rawName);
    } else if (req.body.slug) {
      req.body.slug = slugify(req.body.slug);
    }
    if (!req.body.parentId) {
      req.body.parentId = "Root";
    }
    if (!req.body.parentName) {
      req.body.parentName = "Home";
    }
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(200).send({
      message: "Category Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// all multiple category
const addAllCategory = async (req, res) => {
  try {
    await Category.deleteMany();
    const sanitizedDocs = (req.body || []).map((cat) => {
      const rawName = getCategoryRawName(cat.name);
      return {
        ...cat,
        slug: cat.slug ? slugify(cat.slug) : slugify(rawName),
        parentId: cat.parentId || "Root",
        parentName: cat.parentName || "Home",
        name: ensureHindiName(cat.name),
        description: ensureHindiDescription(cat.description),
      };
    });
    await Category.insertMany(sanitizedDocs);
    res.status(200).send({
      message: "Category Added Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// get status show category
const getShowingCategory = async (req, res) => {
  try {
    const categories = await Category.find({ status: "show" }).sort({
      createdAt: -1,
    });
    const categoryList = readyToParentAndChildrenCategory(categories);
    const filtered = (categoryList || []).filter((c) => {
      const name = String(c.name?.en || c.name || "").toLowerCase().trim();
      const slug = String(c.slug || "").toLowerCase().trim();
      return name !== "home" && slug !== "home" && c.id !== "Root";
    });
    res.send(filtered);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// get all category parent and child
const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    const categoryList = readyToParentAndChildrenCategory(categories);
    res.send(categoryList);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ createdAt: -1 });
    res.send(categories);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    res.send(category);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// category update
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      const incomingName = req.body.name ? ensureHindiName(req.body.name) : {};
      category.name = { ...category.name, ...incomingName };
      if (category.name && (!category.name.hi || !String(category.name.hi).trim()) && category.name.en) {
        category.name = ensureHindiName(category.name);
      }

      const incomingDesc = req.body.description ? ensureHindiDescription(req.body.description) : {};
      category.description = {
        ...category.description,
        ...incomingDesc,
      };
      if (category.description && (!category.description.hi || !String(category.description.hi).trim()) && category.description.en) {
        category.description = ensureHindiDescription(category.description);
      }

      category.icon = req.body.icon;
      category.status = req.body.status;
      category.parentId = req.body.parentId
        ? req.body.parentId
        : (category.parentId || "Root");
      category.parentName = req.body.parentName || category.parentName || "Home";
      category.featured = req.body.featured !== undefined ? req.body.featured : category.featured;
      category.priority = req.body.priority || category.priority;
      category.banner = req.body.banner;
      if (req.body.slug) {
        category.slug = slugify(req.body.slug);
      } else if (!category.slug) {
        category.slug = slugify(getCategoryRawName(category.name));
      }

      await category.save();
      res.send({ message: "Category Updated Successfully!" });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// udpate many category
const updateManyCategory = async (req, res) => {
  try {
    const updatedData = {};
    for (const key in req.body) {
      if (req.body[key] !== "" && key !== "ids") {
        updatedData[key] = req.body[key];
      }
    }

    await Category.updateMany(
      { _id: { $in: req.body.ids } },
      {
        $set: updatedData,
      }
    );

    res.status(200).send({
      message: "Categories Updated Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// category update status
const updateStatus = async (req, res) => {
  try {
    const newStatus = req.body.status;
    await Category.updateOne(
      { _id: req.params.id },
      { $set: { status: newStatus } }
    );
    res.status(200).send({
      message: `Category ${newStatus === "show" ? "Published" : "Un-Published"} Successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateFeatured = async (req, res) => {
  try {
    const newFeatured = req.body.featured;
    await Category.updateOne(
      { _id: req.params.id },
      { $set: { featured: newFeatured } }
    );
    res.status(200).send({
      message: `Category Featured ${newFeatured ? "Enabled" : "Disabled"} Successfully!`,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

//single category delete
const deleteCategory = async (req, res) => {
  try {
    await Category.deleteOne({ _id: req.params.id });
    await Category.deleteMany({ parentId: req.params.id });
    res.status(200).send({
      message: "Category Deleted Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

// all multiple category delete
const deleteManyCategory = async (req, res) => {
  try {
    await Category.deleteMany({ parentId: { $in: req.body.ids } });
    await Category.deleteMany({ _id: { $in: req.body.ids } });
    res.status(200).send({
      message: "Categories Deleted Successfully!",
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getCategoryKey = (cat) => {
  if (cat?.slug) return String(cat.slug).toLowerCase();
  const name = cat?.name?.en || cat?.name || "";
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-");
};

const readyToParentAndChildrenCategory = (categories, parentId = null) => {
  const parent =
    parentId == null
      ? null
      : categories.find((c) => String(c._id) === String(parentId));

  const matchesParent = (cat) => {
    if (parent && String(cat._id) === String(parent._id)) return false;

    if (!parent) {
      const pid = String(cat.parentId || "").toLowerCase();
      if (!cat.parentId || pid === "root") return true;
      return !categories.some(
        (p) =>
          String(p._id) === cat.parentId ||
          getCategoryKey(p) === pid ||
          (p.id && String(p.id).toLowerCase() === pid)
      );
    }

    const pid = String(cat.parentId || "").toLowerCase();
    const parentKey = getCategoryKey(parent);
    const parentName = String(parent.name?.en || parent.name || "").toLowerCase();

    return (
      pid === String(parent._id).toLowerCase() ||
      pid === parentKey ||
      (cat.parentName &&
        String(cat.parentName).toLowerCase() === parentName &&
        pid !== "root")
    );
  };

  return categories.filter(matchesParent).map((item) => {
    const rawName = getCategoryRawName(item.name);
    return {
      _id: item._id,
      name: item.name,
      slug: item.slug || slugify(rawName),
      parentId: item.parentId || "Root",
      parentName: item.parentName || "Home",
      description: item.description,
      icon: item.icon,
      images: item.images || [],
      banner: item.banner || "",
      status: item.status,
      featured: item.featured,
      priority: item.priority,
      children: readyToParentAndChildrenCategory(categories, item._id),
    };
  });
};


module.exports = {
  addCategory,
  addAllCategory,
  getAllCategory,
  getShowingCategory,
  getCategoryById,
  updateCategory,
  updateStatus,
  updateFeatured,
  deleteCategory,
  deleteManyCategory,
  getAllCategories,
  updateManyCategory,
};
