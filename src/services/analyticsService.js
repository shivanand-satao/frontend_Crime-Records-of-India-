import api from "./api";

const analyticsService = {
  getOverview() {
    return api.get("/analytics/overview");
  },
};

export default analyticsService;
