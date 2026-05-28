import Center from "../models/centerModel.js";

// (Unused at the moment – routes use model directly)
// Keeping basic helpers here if needed later.

export const addCenter = async (req, res) => {
  try {
    const center = await Center.create(req.body);
    return res.status(201).json(center);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getCenters = async (_req, res) => {
  try {
    const centers = await Center.find();
    return res.json(centers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
