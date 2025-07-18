'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  InformationHubContextType, 
  Notification, 
  ChangeLogEntry, 
  SupportTicket, 
  UserGuide, 
  TrainingCourse, 
  Task, 
  CommunityPost, 
  DashboardWidget,
  InformationHubReport
} from '@/types/information-hub';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

interface InformationHubState {
  notifications: Notification[];
  unreadCount: number;
  changeLog: ChangeLogEntry[];
  tickets: SupportTicket[];
  guides: UserGuide[];
  courses: TrainingCourse[];
  tasks: Task[];
  posts: CommunityPost[];
  widgets: DashboardWidget[];
  reports: InformationHubReport[];
  isLoading: boolean;
  error: string | null;
}

type InformationHubAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'SET_CHANGELOG'; payload: ChangeLogEntry[] }
  | { type: 'SET_TICKETS'; payload: SupportTicket[] }
  | { type: 'ADD_TICKET'; payload: SupportTicket }
  | { type: 'UPDATE_TICKET'; payload: { id: string; updates: Partial<SupportTicket> } }
  | { type: 'SET_GUIDES'; payload: UserGuide[] }
  | { type: 'SET_COURSES'; payload: TrainingCourse[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'SET_POSTS'; payload: CommunityPost[] }
  | { type: 'ADD_POST'; payload: CommunityPost }
  | { type: 'SET_WIDGETS'; payload: DashboardWidget[] }
  | { type: 'UPDATE_WIDGET'; payload: { id: string; updates: Partial<DashboardWidget> } };

const initialState: InformationHubState = {
  notifications: [],
  unreadCount: 0,
  changeLog: [],
  tickets: [],
  guides: [],
  courses: [],
  tasks: [],
  posts: [],
  widgets: [],
  reports: [],
  isLoading: false,
  error: null,
};

function informationHubReducer(state: InformationHubState, action: InformationHubAction): InformationHubState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_NOTIFICATIONS':
      return { 
        ...state, 
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.isRead).length
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + (action.payload.isRead ? 0 : 1)
      };
    
    case 'SET_CHANGELOG':
      return { ...state, changeLog: action.payload };
    
    case 'SET_TICKETS':
      return { ...state, tickets: action.payload };
    
    case 'ADD_TICKET':
      return { ...state, tickets: [action.payload, ...state.tickets] };
    
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        )
      };
    
    case 'SET_GUIDES':
      return { ...state, guides: action.payload };
    
    case 'SET_COURSES':
      return { ...state, courses: action.payload };
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        )
      };
    
    case 'SET_POSTS':
      return { ...state, posts: action.payload };
    
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    
    case 'SET_WIDGETS':
      return { ...state, widgets: action.payload };
    
    case 'UPDATE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.map(w =>
          w.id === action.payload.id ? { ...w, ...action.payload.updates } : w
        )
      };
    
    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const InformationHubContext = createContext<InformationHubContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface InformationHubProviderProps {
  children: React.ReactNode;
}

export function InformationHubProvider({ children }: InformationHubProviderProps) {
  const [state, dispatch] = useReducer(informationHubReducer, initialState);

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const markAsRead = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // API call to mark notification as read
      const response = await fetch(`/api/information-hub/notifications/${id}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to mark notification as read');
      
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark notification as read' });
      console.error('Error marking notification as read:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const markAllAsRead = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/information-hub/notifications/mark-all-read', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to mark all notifications as read');
      
      dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to mark all notifications as read' });
      console.error('Error marking all notifications as read:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createTicket = async (ticket: Partial<SupportTicket>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/information-hub/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      });
      
      if (!response.ok) throw new Error('Failed to create ticket');
      
      const newTicket = await response.json();
      dispatch({ type: 'ADD_TICKET', payload: newTicket });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create ticket' });
      console.error('Error creating ticket:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`/api/information-hub/training/courses/${courseId}/enroll`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to enroll in course');
      
      // Refresh courses data
      await loadCourses();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to enroll in course' });
      console.error('Error enrolling in course:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createTask = async (task: Partial<Task>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/information-hub/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) throw new Error('Failed to create task');
      
      const newTask = await response.json();
      dispatch({ type: 'ADD_TASK', payload: newTask });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create task' });
      console.error('Error creating task:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`/api/information-hub/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
      console.error('Error updating task:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createPost = async (post: Partial<CommunityPost>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/information-hub/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      
      if (!response.ok) throw new Error('Failed to create post');
      
      const newPost = await response.json();
      dispatch({ type: 'ADD_POST', payload: newPost });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create post' });
      console.error('Error creating post:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateWidget = async (id: string, updates: Partial<DashboardWidget>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`/api/information-hub/dashboard/widgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) throw new Error('Failed to update widget');
      
      dispatch({ type: 'UPDATE_WIDGET', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update widget' });
      console.error('Error updating widget:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateReport = async (reportId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch(`/api/information-hub/reports/${reportId}/generate`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      // Handle report download/display
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportId}-${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to generate report' });
      console.error('Error generating report:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // ============================================================================
  // DATA LOADING FUNCTIONS
  // ============================================================================

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/information-hub/notifications');
      if (!response.ok) throw new Error('Failed to load notifications');
      const notifications = await response.json();
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadChangeLog = async () => {
    try {
      const response = await fetch('/api/information-hub/changelog');
      if (!response.ok) throw new Error('Failed to load changelog');
      const changelog = await response.json();
      dispatch({ type: 'SET_CHANGELOG', payload: changelog });
    } catch (error) {
      console.error('Error loading changelog:', error);
    }
  };

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/information-hub/tickets');
      if (!response.ok) throw new Error('Failed to load tickets');
      const tickets = await response.json();
      dispatch({ type: 'SET_TICKETS', payload: tickets });
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const loadGuides = async () => {
    try {
      const response = await fetch('/api/information-hub/guides');
      if (!response.ok) throw new Error('Failed to load guides');
      const guides = await response.json();
      dispatch({ type: 'SET_GUIDES', payload: guides });
    } catch (error) {
      console.error('Error loading guides:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/information-hub/training/courses');
      if (!response.ok) throw new Error('Failed to load courses');
      const courses = await response.json();
      dispatch({ type: 'SET_COURSES', payload: courses });
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/information-hub/tasks');
      if (!response.ok) throw new Error('Failed to load tasks');
      const tasks = await response.json();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/information-hub/community/posts');
      if (!response.ok) throw new Error('Failed to load posts');
      const posts = await response.json();
      dispatch({ type: 'SET_POSTS', payload: posts });
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const loadWidgets = async () => {
    try {
      const response = await fetch('/api/information-hub/dashboard/widgets');
      if (!response.ok) throw new Error('Failed to load widgets');
      const widgets = await response.json();
      dispatch({ type: 'SET_WIDGETS', payload: widgets });
    } catch (error) {
      console.error('Error loading widgets:', error);
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Initial data loading
    const loadInitialData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        await Promise.all([
          loadNotifications(),
          loadChangeLog(),
          loadTickets(),
          loadGuides(),
          loadCourses(),
          loadTasks(),
          loadPosts(),
          loadWidgets(),
        ]);
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load initial data' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadInitialData();
  }, []);

  // WebSocket for real-time notifications
  useEffect(() => {
    const setupWebSocket = () => {
      const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'notification') {
          dispatch({ type: 'ADD_NOTIFICATION', payload: data.payload });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      return ws;
    };

    const ws = setupWebSocket();
    
    return () => {
      ws.close();
    };
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: InformationHubContextType = {
    // Data
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    changeLog: state.changeLog,
    tickets: state.tickets,
    guides: state.guides,
    courses: state.courses,
    tasks: state.tasks,
    posts: state.posts,
    widgets: state.widgets,
    
    // Actions
    markAsRead,
    markAllAsRead,
    createTicket,
    enrollInCourse,
    createTask,
    updateTask,
    createPost,
    updateWidget,
    generateReport,
    
    // State
    isLoading: state.isLoading,
    error: state.error,
  };

  return (
    <InformationHubContext.Provider value={contextValue}>
      {children}
    </InformationHubContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useInformationHub() {
  const context = useContext(InformationHubContext);
  if (context === undefined) {
    throw new Error('useInformationHub must be used within an InformationHubProvider');
  }
  return context;
}
