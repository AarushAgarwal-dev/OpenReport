// Report Engine - handles filtering, sorting, grouping, and transformations

/**
 * Apply filters to a dataset
 */
export function applyFilters(data, filters) {
  if (!filters || filters.length === 0) return data;

  return data.filter(row => {
    return filters.every(filter => {
      const value = row[filter.column];
      const filterValue = filter.value;

      switch (filter.operator) {
        case 'equals':
          return String(value).toLowerCase() === String(filterValue).toLowerCase();
        case 'notEquals':
          return String(value).toLowerCase() !== String(filterValue).toLowerCase();
        case 'contains':
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'notContains':
          return !String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
        case 'greaterThan':
          return Number(value) > Number(filterValue);
        case 'lessThan':
          return Number(value) < Number(filterValue);
        case 'greaterOrEqual':
          return Number(value) >= Number(filterValue);
        case 'lessOrEqual':
          return Number(value) <= Number(filterValue);
        case 'between':
          return Number(value) >= Number(filter.value) && Number(value) <= Number(filter.valueTo);
        case 'in':
          const vals = String(filterValue).split(',').map(v => v.trim().toLowerCase());
          return vals.includes(String(value).toLowerCase());
        case 'isEmpty':
          return value === null || value === undefined || value === '';
        case 'isNotEmpty':
          return value !== null && value !== undefined && value !== '';
        case 'dateBefore':
          return new Date(value) < new Date(filterValue);
        case 'dateAfter':
          return new Date(value) > new Date(filterValue);
        case 'dateBetween':
          return new Date(value) >= new Date(filter.value) && new Date(value) <= new Date(filter.valueTo);
        default:
          return true;
      }
    });
  });
}

/**
 * Apply sorting to a dataset
 */
export function applySort(data, sortConfig) {
  if (!sortConfig || !sortConfig.key) return data;

  return [...data].sort((a, b) => {
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];

    // Handle null/undefined
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    // Check if numeric
    if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
      aVal = Number(aVal);
      bVal = Number(bVal);
    } else {
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Apply grouping to a dataset
 */
export function applyGrouping(data, groupByKey, aggregations = []) {
  if (!groupByKey) return null;

  const groups = {};
  data.forEach(row => {
    const groupValue = row[groupByKey] ?? 'N/A';
    if (!groups[groupValue]) {
      groups[groupValue] = [];
    }
    groups[groupValue].push(row);
  });

  // Calculate aggregations for each group
  const result = Object.entries(groups).map(([groupValue, rows]) => {
    const aggs = {};
    aggregations.forEach(agg => {
      const values = rows.map(r => Number(r[agg.column])).filter(v => !isNaN(v));
      switch (agg.function) {
        case 'sum':
          aggs[`${agg.column}_sum`] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          aggs[`${agg.column}_avg`] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          break;
        case 'min':
          aggs[`${agg.column}_min`] = values.length ? Math.min(...values) : 0;
          break;
        case 'max':
          aggs[`${agg.column}_max`] = values.length ? Math.max(...values) : 0;
          break;
        case 'count':
          aggs[`${agg.column}_count`] = rows.length;
          break;
      }
    });

    return {
      groupValue,
      count: rows.length,
      rows,
      aggregations: aggs,
    };
  });

  return result.sort((a, b) => b.count - a.count);
}

/**
 * Select specific columns from data
 */
export function selectColumns(data, columns) {
  if (!columns || columns.length === 0) return data;
  return data.map(row => {
    const selected = {};
    columns.forEach(col => {
      selected[col] = row[col];
    });
    return selected;
  });
}

/**
 * Execute a full report pipeline
 */
export function executeReport(rawData, config) {
  let data = [...rawData];

  // 1. Apply filters
  data = applyFilters(data, config.filters);

  // 2. Apply sorting
  data = applySort(data, config.sortBy);

  // 3. Select columns
  const selectedData = selectColumns(data, config.columns);

  // 4. Apply grouping
  const grouped = config.groupBy
    ? applyGrouping(data, config.groupBy, config.aggregations || [])
    : null;

  return {
    data: selectedData,
    fullData: data,
    grouped,
    totalRows: rawData.length,
    filteredRows: data.length,
  };
}

/**
 * Export data to CSV
 */
export function exportToCSV(data, columns, columnMeta) {
  if (!data || data.length === 0) return '';

  const headers = columns.map(col => {
    const meta = columnMeta?.find(m => m.key === col);
    return meta ? meta.label : col;
  });

  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Get filter operators based on column type
 */
export function getOperatorsForType(type) {
  switch (type) {
    case 'number':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not equals' },
        { value: 'greaterThan', label: 'Greater than' },
        { value: 'lessThan', label: 'Less than' },
        { value: 'greaterOrEqual', label: 'Greater or equal' },
        { value: 'lessOrEqual', label: 'Less or equal' },
        { value: 'between', label: 'Between' },
      ];
    case 'date':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'dateBefore', label: 'Before' },
        { value: 'dateAfter', label: 'After' },
        { value: 'dateBetween', label: 'Between' },
      ];
    case 'string':
    default:
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'notContains', label: 'Does not contain' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
        { value: 'in', label: 'In list' },
        { value: 'isEmpty', label: 'Is empty' },
        { value: 'isNotEmpty', label: 'Is not empty' },
      ];
  }
}
