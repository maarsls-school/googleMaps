import axios from "axios";

const api = axios.create({
  baseURL: "https://os-beyond.at/htl/geo",
  //baseURL: 'http://127.0.0.1:5000/',
  timeout: 10000,
});

const GeoAPI = {
  getAllMarkers: async () => {
    try {
      const resp = await api.get("/geoinfos");
      return resp.data;
    } catch (err) {
      // Handle Error Here
      console.error(err);
    }
  },
  putLocation: async (location) => {
    try {
      const resp = await api.put("/geoinfo/0", { info: location });
      return resp.data;
    } catch (err) {
      // Handle Error Here
      console.error(err);
    }
  },
};

module.exports = GeoAPI;
