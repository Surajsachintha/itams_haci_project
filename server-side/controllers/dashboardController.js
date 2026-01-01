const pool = require('../config/dash-db');

exports.getStats = async (req, res) => {
  try {
    const [totalDevices] = await pool.execute(
      'SELECT COUNT(*) as count FROM dms_devices WHERE is_delete = 0'
    );

    const [activeDevices] = await pool.execute(
      'SELECT COUNT(*) as count FROM dms_devices WHERE status = ? AND is_delete = 0',
      ['ACTIVE']
    );

    const [inRepair] = await pool.execute(
      'SELECT COUNT(*) as count FROM dms_devices WHERE status = ? AND is_delete = 0',
      ['IN_REPAIR']
    );

    const [condemned] = await pool.execute(
      'SELECT COUNT(*) as count FROM dms_devices WHERE status = ? AND is_delete = 0',
      ['CONDEMNED']
    );

    const [totalValue] = await pool.execute(
      'SELECT COALESCE(SUM(purchase_value), 0) as total FROM dms_devices WHERE is_delete = 0'
    );

    const [recentRegistrations] = await pool.execute(
      `SELECT COUNT(*) as count FROM dms_devices 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND is_delete = 0`
    );

    const [warrantyExpiring] = await pool.execute(
      `SELECT COUNT(*) as count FROM dms_devices 
       WHERE warranty_expire_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY) 
       AND status = 'ACTIVE' AND is_delete = 0`
    );
    const [divisions] = await pool.execute(
      `SELECT COUNT(DISTINCT station_id) as count FROM dms_devices WHERE is_delete = 0 AND station_id IS NOT NULL`
    );

    res.json({
      status: 'success',
      data: {
        totalDevices: totalDevices[0]?.count || 0,
        activeDevices: activeDevices[0]?.count || 0,
        inRepair: inRepair[0]?.count || 0,
        condemned: condemned[0]?.count || 0,
        totalValue: totalValue[0]?.total || 0,
        recentRegistrations: recentRegistrations[0]?.count || 0,
        warrantyExpiring: warrantyExpiring[0]?.count || 0,
        divisions: divisions[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      status: 'error',
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Failed to fetch dashboard statistics',
        details: error.message 
      }
    });
  }
};

exports.getDevicesByCategory = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      `SELECT 
        c.id as category_id,
        c.category_name,
        COUNT(d.id) as count
       FROM code_categories c
       LEFT JOIN dms_devices d ON c.id = d.category_id AND d.is_delete = 0
       GROUP BY c.id, c.category_name
       ORDER BY count DESC`
    );

    res.json({
      status: 'success',
      data: categories || []
    });
  } catch (error) {
    console.error('Devices by category error:', error);
    res.status(500).json({
      status: 'error',
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Failed to fetch devices by category',
        details: error.message 
      }
    });
  }
};

exports.getDevicesByStation = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [stations] = await pool.query(
      `SELECT 
        s.station_id as station_id,
        s.station_name,
        COALESCE(d.division_name, 'Unknown') as division_name,
        COUNT(dev.id) as count
       FROM code_stations s
       LEFT JOIN code_divisions d ON s.division_id = d.division_id
       LEFT JOIN dms_devices dev ON s.station_id = dev.station_id AND dev.is_delete = 0
       GROUP BY s.station_id, s.station_name, d.division_name
       HAVING count > 0
       ORDER BY count DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      status: 'success',
      data: stations || []
    });
  } catch (error) {
    console.error('Devices by station error:', error);
    res.status(500).json({
      status: 'error',
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Failed to fetch devices by station',
        details: error.message 
      }
    });
  }
};

exports.getTopBrands = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const [brands] = await pool.query(
      `SELECT 
        b.id as brand_id,
        b.brand_name,
        COUNT(d.id) as count
       FROM code_brand_name b
       LEFT JOIN dms_devices d ON b.id = d.brand_id AND d.is_delete = 0
       GROUP BY b.id, b.brand_name
       HAVING count > 0
       ORDER BY count DESC
       LIMIT ?`,
      [limit]
    );

    res.json({
      status: 'success',
      data: brands || []
    });
  } catch (error) {
    console.error('Top brands error:', error);
    res.status(500).json({
      status: 'error',
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Failed to fetch top brands',
        details: error.message 
      }
    });
  }
};

exports.getDeviceStatus = async (req, res) => {
  try {
    const [statuses] = await pool.execute(
      `SELECT 
        status,
        COUNT(*) as count
       FROM dms_devices
       WHERE is_delete = 0
       GROUP BY status
       ORDER BY count DESC`
    );

    res.json({
      status: 'success',
      data: statuses || []
    });
  } catch (error) {
    console.error('Device status error:', error);
    res.status(500).json({
      status: 'error',
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Failed to fetch device status distribution',
        details: error.message 
      }
    });
  }
};

exports.getRegistrationTrend = async (req, res) => {
  try {
    const [trend] = await pool.execute(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
       FROM dms_devices
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
       AND is_delete = 0
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );

    res.json({
      status: 'success',
      data: trend || []
    });
  } catch (error) {
    console.error('Registration trend error:', error);
    res.status(500).json({
      status: 'error',
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Failed to fetch registration trend',
        details: error.message 
      }
    });
  }
};

exports.getWarrantyAlerts = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const [alerts] = await pool.execute(
      `SELECT 
        d.id,
        d.asset_tag_number,
        d.serial_number,
        d.warranty_expire_date,
        COALESCE(b.brand_name, 'Unknown') as brand_name,
        COALESCE(m.model_name, 'Unknown') as model_name,
        COALESCE(s.station_name, 'Unknown') as station_name,
        DATEDIFF(d.warranty_expire_date, NOW()) as days_remaining
       FROM dms_devices d
       LEFT JOIN code_brand_name b ON d.brand_id = b.id
       LEFT JOIN code_models m ON d.model_id = m.id
       LEFT JOIN code_stations s ON d.station_id = s.station_id
       WHERE d.warranty_expire_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL ? DAY)
       AND d.status = 'ACTIVE'
       AND d.is_delete = 0
       ORDER BY d.warranty_expire_date ASC`,
      [days]
    );

    res.json({
      status: 'success',
      data: alerts || []
    });
  } catch (error) {
    console.error('Warranty alerts error:', error);
    res.status(500).json({
      status: 'error',
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Failed to fetch warranty alerts',
        details: error.message 
      }
    });
  }
};

exports.getValueByCategory = async (req, res) => {
  try {
    const [values] = await pool.execute(
      `SELECT 
        c.id as category_id,
        c.category_name,
        COALESCE(SUM(d.purchase_value), 0) as total_value,
        COUNT(d.id) as device_count,
        COALESCE(AVG(d.purchase_value), 0) as avg_value
       FROM code_categories c
       LEFT JOIN dms_devices d ON c.id = d.category_id AND d.is_delete = 0
       GROUP BY c.id, c.category_name
       HAVING total_value > 0
       ORDER BY total_value DESC`
    );

    res.json({
      status: 'success',
      data: values || []
    });
  } catch (error) {
    console.error('Value by category error:', error);
    res.status(500).json({
      status: 'error',
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Failed to fetch value by category',
        details: error.message 
      }
    });
  }
};

exports.getDevicesByAge = async (req, res) => {
  try {
    const [ageGroups] = await pool.execute(
      `SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(MONTH, purchase_date, NOW()) <= 12 THEN '0-1 years'
          WHEN TIMESTAMPDIFF(MONTH, purchase_date, NOW()) <= 24 THEN '1-2 years'
          WHEN TIMESTAMPDIFF(MONTH, purchase_date, NOW()) <= 36 THEN '2-3 years'
          WHEN TIMESTAMPDIFF(MONTH, purchase_date, NOW()) <= 60 THEN '3-5 years'
          ELSE '5+ years'
        END as age_group,
        COUNT(*) as count
       FROM dms_devices
       WHERE is_delete = 0 AND purchase_date IS NOT NULL
       GROUP BY age_group
       ORDER BY 
        CASE age_group
          WHEN '0-1 years' THEN 1
          WHEN '1-2 years' THEN 2
          WHEN '2-3 years' THEN 3
          WHEN '3-5 years' THEN 4
          ELSE 5
        END`
    );

    res.json({
      status: 'success',
      data: ageGroups || []
    });
  } catch (error) {
    console.error('Devices by age error:', error);
    res.status(500).json({
      status: 'error',
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Failed to fetch devices by age',
        details: error.message 
      }
    });
  }
};