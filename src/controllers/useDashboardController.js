import { useState, useEffect } from 'react';
import { propertyService } from '../services/propertyService';
import { userService } from '../services/userService';
import { leadService } from '../services/leadService';
import { auditService } from '../services/auditService';
import { useAuth } from './auth';

export const useDashboardController = () => {
  const { user, adminProfile, logAction } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pendingProperties, setPendingProperties] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [chartsData, setChartsData] = useState({});

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch properties
      const { data: properties, error: propErr } = await propertyService.getProperties();
      if (propErr) throw propErr;

      // 2. Fetch users
      const { data: users, error: userErr } = await userService.getUsers();
      if (userErr) throw userErr;

      // 3. Fetch enquiries/leads
      const { data: enquiries, error: enqErr } = await leadService.getLeads();
      if (enqErr) throw enqErr;

      // 4. Fetch recent logs
      const { data: logs, error: logsErr } = await auditService.getAuditLogs(5);
      if (logsErr) throw logsErr;

      const propList = properties || [];
      const userList = users || [];
      const enqList = enquiries || [];
      const logList = logs || [];

      // Calculate stats
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);

      const totalProperties = propList.length;
      const approvedProperties = propList.filter(p => p.status === 'approved').length;
      const pendingPropertiesCount = propList.filter(p => p.status === 'pending' && !p.rejection_reason).length;
      const rejectedProperties = propList.filter(p => p.status === 'pending' && p.rejection_reason).length;
      const soldProperties = propList.filter(p => p.status === 'sold').length;
      const activeProperties = propList.filter(p => p.status === 'approved' || p.status === 'active').length;
      const inactiveProperties = propList.filter(p => p.status === 'inactive').length;
      const featuredProperties = propList.filter(p => p.is_featured === true).length;

      const totalUsers = userList.length;
      const totalSellers = userList.filter(u => u.user_type === 'seller').length;
      const totalBuyers = userList.filter(u => u.user_type === 'buyer').length;
      const todayNewUsers = userList.filter(u => new Date(u.created_at) >= todayStart).length;

      const todayNewProperties = propList.filter(p => new Date(p.created_at) >= todayStart).length;
      const totalLeads = enqList.length;
      const todayLeads = enqList.filter(e => new Date(e.created_at) >= todayStart).length;

      const totalViews = propList.reduce((acc, curr) => acc + (curr.views || 0), 0);
      const totalLikes = propList.reduce((acc, curr) => acc + (curr.favorites_count || 0), 0);

      const approvedProps = propList.filter(p => p.status === 'approved');
      const totalApprovedValue = approvedProps.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0);
      const brokerageSavedAmount = totalApprovedValue * 0.02; // Est. 2% brokerage saved
      const formattedBrokerage = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(brokerageSavedAmount);

      setStats({
        totalProperties, approvedProperties, pendingPropertiesCount, rejectedProperties,
        soldProperties, activeProperties, inactiveProperties, featuredProperties,
        totalUsers, totalSellers, totalBuyers, todayNewUsers,
        todayNewProperties, totalLeads, todayLeads, totalViews, totalLikes,
        brokerageSaved: formattedBrokerage
      });

      // Recent users & Pending properties
      setPendingProperties(
        propList
          .filter(p => p.status === 'pending' && !p.rejection_reason)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .slice(0, 5)
      );
      setRecentLogs(logList);

      // Recharts calculations
      // A. Property Upload Trend (Group by month)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const uploadTrendMap = {};
      propList.forEach(p => {
        const d = new Date(p.created_at);
        const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
        uploadTrendMap[key] = (uploadTrendMap[key] || 0) + 1;
      });
      const uploadTrend = Object.keys(uploadTrendMap).map(k => ({ name: k, Properties: uploadTrendMap[k] })).slice(-6);

      // B. Leads Trend
      const leadsTrendMap = {};
      enqList.forEach(e => {
        const d = new Date(e.created_at);
        const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
        leadsTrendMap[key] = (leadsTrendMap[key] || 0) + 1;
      });
      const leadsTrend = Object.keys(leadsTrendMap).map(k => ({ name: k, Leads: leadsTrendMap[k] })).slice(-6);

      // C. Property type distribution
      const typeMap = {};
      propList.forEach(p => {
        const t = p.property_type || 'Other';
        typeMap[t] = (typeMap[t] || 0) + 1;
      });
      const typeData = Object.keys(typeMap).map(k => ({ name: k, value: typeMap[k] }));

      // D. City wise distribution
      const cityMap = {};
      propList.forEach(p => {
        const c = p.city || 'Unknown';
        cityMap[c] = (cityMap[c] || 0) + 1;
      });
      const cityData = Object.keys(cityMap).map(k => ({ name: k, properties: cityMap[k] })).sort((a,b) => b.properties - a.properties).slice(0, 5);

      setChartsData({
        uploadTrend,
        leadsTrend: leadsTrend.length > 0 ? leadsTrend : [{ name: 'Current', Leads: totalLeads }],
        typeData,
        cityData,
        approvalData: [
          { name: 'Approved', value: approvedProperties },
          { name: 'Pending', value: pendingPropertiesCount },
          { name: 'Needs Revision', value: rejectedProperties }
        ]
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Custom confirmation modal states
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmType, setConfirmType] = useState('info');
  const [pendingAction, setPendingAction] = useState(null);

  const handleQuickApprove = (propertyId, title) => {
    setConfirmTitle('Quick Approve Listing');
    setConfirmMessage(`Are you sure you want to approve "${title}"? This property listing will immediately go live on the public marketplace.`);
    setConfirmType('success');
    setPendingAction(() => async () => {
      const { error } = await propertyService.updatePropertyStatus(propertyId, 'approved');
      if (error) throw error;

      await logAction(
        user?.id,
        adminProfile?.full_name || 'System',
        'Approve',
        propertyId,
        `Approved property "${title}" via quick action`
      );

      await propertyService.insertStatusHistory(
        propertyId,
        user?.id,
        adminProfile?.full_name || 'System',
        'pending',
        'approved',
        null,
        'Quick approved from dashboard'
      );
    });
    setConfirmOpen(true);
  };

  const executeConfirmAction = async () => {
    if (!pendingAction) return;
    setLoading(true);
    try {
      await pendingAction();
      setConfirmOpen(false);
      setPendingAction(null);
      await fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    stats,
    pendingProperties,
    recentLogs,
    chartsData,
    confirmOpen,
    setConfirmOpen,
    confirmTitle,
    confirmMessage,
    confirmType,
    handleQuickApprove,
    executeConfirmAction,
    fetchDashboardData
  };
};
