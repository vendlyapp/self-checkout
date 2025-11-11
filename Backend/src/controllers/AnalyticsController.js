const analyticsService = require('../services/AnalyticsService');
const { HTTP_STATUS } = require('../types');

class AnalyticsController {
  async getActiveOverview(req, res) {
    try {
      const { interval } = req.query;
      const data = await analyticsService.getActiveOverview({
        intervalMinutes: interval ? Number(interval) : undefined,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getActiveCustomersByStore(req, res) {
    try {
      const { interval } = req.query;
      const data = await analyticsService.getActiveCustomersByStore({
        intervalMinutes: interval ? Number(interval) : undefined,
      });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }
  async getSalesOverTime(req, res) {
    try {
      const { from, to, granularity } = req.query;
      const data = await analyticsService.getSalesOverTime({ from, to, granularity });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getStorePerformance(req, res) {
    try {
      const { from, to, limit } = req.query;
      const data = await analyticsService.getStorePerformance({ from, to, limit });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getTopProducts(req, res) {
    try {
      const { from, to, limit, metric } = req.query;
      const data = await analyticsService.getTopProducts({ from, to, limit, metric });

      res.status(HTTP_STATUS.OK).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new AnalyticsController();


