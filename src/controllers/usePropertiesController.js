import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { propertyService, getReviewStatus } from '../services/propertyService';

export const usePropertiesController = () => {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [filteredProps, setFilteredProps] = useState([]);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all'); // sale, rent
  const [featuredFilter, setFeaturedFilter] = useState('all'); // yes, no

  // Sorting & Pagination States
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique cities and types for dropdowns
  const [cities, setCities] = useState([]);
  const [types, setTypes] = useState([]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const { data, error } = await propertyService.getProperties();

      if (error) throw error;

      const list = data || [];
      setProperties(list);
      setFilteredProps(list);

      // Extract filter metrics
      const uniqueCities = [...new Set(list.map(p => p.city).filter(Boolean))];
      const uniqueTypes = [...new Set(list.map(p => p.property_type).filter(Boolean))];
      setCities(uniqueCities);
      setTypes(uniqueTypes);

    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Update statusFilter when URL query parameter changes
  useEffect(() => {
    if (filterParam) {
      if (filterParam === 'featured') {
        setStatusFilter('all');
        setFeaturedFilter('yes');
      } else {
        setStatusFilter(filterParam);
        setFeaturedFilter('all');
      }
    } else {
      setStatusFilter('all');
      setFeaturedFilter('all');
    }
  }, [filterParam]);

  // Apply Client-side filtering, searching and sorting
  useEffect(() => {
    let result = [...properties];

    // Search query
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(p => 
        (p.title || '').toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q) ||
        (p.city || '').toLowerCase().includes(q) ||
        (p.owner?.full_name || '').toLowerCase().includes(q) ||
        (p.owner?.phone_number || '').includes(q)
      );
    }

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(p => getReviewStatus(p) === statusFilter);
    }

    // Property Type Filter
    if (typeFilter !== 'all') {
      result = result.filter(p => p.property_type === typeFilter);
    }

    // City Filter
    if (cityFilter !== 'all') {
      result = result.filter(p => p.city === cityFilter);
    }

    // Purpose Filter
    if (purposeFilter !== 'all') {
      const isSale = purposeFilter === 'sale';
      result = result.filter(p => p.is_for_sale === isSale);
    }

    // Featured Filter
    if (featuredFilter !== 'all') {
      const isFeatured = featuredFilter === 'yes';
      result = result.filter(p => p.is_featured === isFeatured);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle nulls
      if (valA == null) return sortOrder === 'asc' ? 1 : -1;
      if (valB == null) return sortOrder === 'asc' ? -1 : 1;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
    });

    setFilteredProps(result);
    setCurrentPage(1); // Reset page on filter/search change
  }, [search, statusFilter, typeFilter, cityFilter, purposeFilter, featuredFilter, sortBy, sortOrder, properties]);

  // Pagination bounds
  const totalPages = Math.ceil(filteredProps.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProps = filteredProps.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleExportCSV = () => {
    if (filteredProps.length === 0) return;

    // Headers
    const headers = [
      'Property ID', 'Title', 'Seller Name', 'Seller Phone', 
      'Type', 'Purpose', 'Price', 'City', 'Location', 
      'Status', 'Featured', 'Views', 'Likes', 'Created Date'
    ];

    const rows = filteredProps.map(p => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.owner?.full_name || 'N/A',
      p.owner?.phone_number || 'N/A',
      p.property_type || 'N/A',
      p.is_for_sale ? 'Sale' : 'Rent',
      p.price,
      p.city || 'N/A',
      `"${(p.location || '').replace(/"/g, '""')}"`,
      getReviewStatus(p),
      p.is_featured ? 'Yes' : 'No',
      p.views || 0,
      p.favorites_count || 0,
      new Date(p.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `properties_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    loading,
    properties,
    filteredProps,
    paginatedProps,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    cityFilter,
    setCityFilter,
    purposeFilter,
    setPurposeFilter,
    featuredFilter,
    setFeaturedFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    currentPage,
    totalPages,
    startIndex,
    itemsPerPage,
    handlePageChange,
    handleExportCSV,
    cities,
    types
  };
};
