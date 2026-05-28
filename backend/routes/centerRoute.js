import express from "express";
import Center from "../models/centerModel.js";

const router = express.Router();

// Haversine distance in km between two lat/lng pairs
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // km
  const toRad = deg => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @desc    Get all centers
// @route   GET /api/centers
router.get("/", async (req, res) => {
  try {
    const centers = await Center.find();
    res.json(centers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get nearby centers based on lat/lng
// @route   GET /api/centers/nearby?lat=..&lng=..&radiusKm=10
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lng, radiusKm = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng query params are required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radius = Number(radiusKm) || 10;

    if (Number.isNaN(userLat) || Number.isNaN(userLng)) {
      return res.status(400).json({ message: "Invalid lat or lng" });
    }

    const centers = await Center.find({
      "location.lat": { $ne: null },
      "location.lng": { $ne: null }
    });

    const withDistance = centers
      .map(center => {
        const centerLat = center.location?.lat;
        const centerLng = center.location?.lng;
        if (centerLat == null || centerLng == null) return null;
        const d = distanceKm(userLat, userLng, centerLat, centerLng);
        return { center, distanceKm: d };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const withinRadius = withDistance.filter(item => item.distanceKm <= radius);

    return res.json(
      withinRadius.map(item => ({
        ...item.center.toObject(),
        distanceKm: item.distanceKm
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new center
// @route   POST /api/centers
router.post("/", async (req, res) => {
  try {
    const center = new Center(req.body);
    const savedCenter = await center.save();
    res.status(201).json(savedCenter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a center
// @route   PUT /api/centers/:id
router.put("/:id", async (req, res) => {
  try {
    const updatedCenter = await Center.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCenter) return res.status(404).json({ message: "Center not found" });
    res.json(updatedCenter);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a center
// @route   DELETE /api/centers/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletedCenter = await Center.findByIdAndDelete(req.params.id);
    if (!deletedCenter) return res.status(404).json({ message: "Center not found" });
    res.json({ message: "Center deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
