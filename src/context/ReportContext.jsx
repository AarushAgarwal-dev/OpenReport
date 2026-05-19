import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { dataSources, defaultTemplates } from '../data/mockData';

const ReportContext = createContext();

const STORAGE_KEY = 'backoffice_reports';
const DATA_CACHE_KEY = 'backoffice_data_cache';

function loadSavedReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultTemplates;
  } catch {
    return defaultTemplates;
  }
}

function loadDataCache() {
  try {
    const cached = sessionStorage.getItem(DATA_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  
  const data = {};
  Object.entries(dataSources).forEach(([key, source]) => {
    data[key] = source.generator();
  });
  
  try {
    sessionStorage.setItem(DATA_CACHE_KEY, JSON.stringify(data));
  } catch {}
  
  return data;
}

const initialState = {
  savedReports: loadSavedReports(),
  activeReport: null,
  dataCache: null,
  isBuilderOpen: false,
  editingReport: null,
  notifications: [],
  sidebarCollapsed: false,
};

function reportReducer(state, action) {
  switch (action.type) {
    case 'INIT_DATA':
      return { ...state, dataCache: action.payload };
      
    case 'SET_ACTIVE_REPORT':
      return { ...state, activeReport: action.payload };

    case 'SAVE_REPORT': {
      const existing = state.savedReports.find(r => r.id === action.payload.id);
      let newReports;
      if (existing) {
        newReports = state.savedReports.map(r =>
          r.id === action.payload.id
            ? { ...action.payload, updatedAt: new Date().toISOString() }
            : r
        );
      } else {
        newReports = [...state.savedReports, {
          ...action.payload,
          id: action.payload.id || uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }];
      }
      return { ...state, savedReports: newReports };
    }

    case 'DELETE_REPORT':
      return {
        ...state,
        savedReports: state.savedReports.filter(r => r.id !== action.payload),
        activeReport: state.activeReport?.id === action.payload ? null : state.activeReport,
      };

    case 'TOGGLE_FAVORITE': {
      const newReports = state.savedReports.map(r =>
        r.id === action.payload ? { ...r, isFavorite: !r.isFavorite } : r
      );
      return { ...state, savedReports: newReports };
    }

    case 'OPEN_BUILDER':
      return { ...state, isBuilderOpen: true, editingReport: action.payload || null };

    case 'CLOSE_BUILDER':
      return { ...state, isBuilderOpen: false, editingReport: null };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, {
          id: uuidv4(),
          ...action.payload,
          timestamp: new Date().toISOString(),
        }],
      };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };

    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case 'DUPLICATE_REPORT': {
      const original = state.savedReports.find(r => r.id === action.payload);
      if (!original) return state;
      const duplicate = {
        ...original,
        id: uuidv4(),
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFavorite: false,
      };
      return { ...state, savedReports: [...state.savedReports, duplicate] };
    }

    default:
      return state;
  }
}

export function ReportProvider({ children }) {
  const [state, dispatch] = useReducer(reportReducer, initialState);

  // Initialize data on mount
  useEffect(() => {
    const data = loadDataCache();
    dispatch({ type: 'INIT_DATA', payload: data });
  }, []);

  // Persist saved reports
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.savedReports));
    } catch {}
  }, [state.savedReports]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (state.notifications.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION', payload: state.notifications[0].id });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <ReportContext.Provider value={value}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReportContext() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
}
