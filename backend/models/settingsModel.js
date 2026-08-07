const db = require('../config/db');

const settingsModel = {
  getSettings: async () => {
    return db.query(`SELECT * FROM settings ORDER BY setting_key ASC`);
  },

  updateSetting: async (key, value) => {
    await db.query(
      `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, value]
    );
    return { setting_key: key, setting_value: value };
  }
};

module.exports = settingsModel;
