import '@testing-library/jest-dom';

// Mock pour Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    input: (props: any) => <input {...props} />,
    select: ({ children, ...props }: any) => <select {...props}>{children}</select>,
    option: ({ children, ...props }: any) => <option {...props}>{children}</option>,
    textarea: (props: any) => <textarea {...props} />,
    label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
    table: ({ children, ...props }: any) => <table {...props}>{children}</table>,
    thead: ({ children, ...props }: any) => <thead {...props}>{children}</thead>,
    tbody: ({ children, ...props }: any) => <tbody {...props}>{children}</tbody>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
    th: ({ children, ...props }: any) => <th {...props}>{children}</th>,
    td: ({ children, ...props }: any) => <td {...props}>{children}</td>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock pour Recharts
jest.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ children }: any) => <div data-testid="bar">{children}</div>,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: ({ children }: any) => <div data-testid="cell">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: ({ children }: any) => <div data-testid="line">{children}</div>,
  Area: ({ children }: any) => <div data-testid="area">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
}));

// Mock pour date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date, format: string) => {
    if (format === 'MMM dd, yyyy') return 'Jan 01, 2024';
    if (format === 'HH:mm') return '09:00';
    if (format === 'yyyy-MM-dd') return '2024-01-01';
    return date.toISOString();
  }),
  subMonths: jest.fn((date: Date, months: number) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - months);
    return newDate;
  }),
  startOfMonth: jest.fn((date: Date) => {
    const newDate = new Date(date);
    newDate.setDate(1);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }),
  endOfMonth: jest.fn((date: Date) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1, 0);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }),
  isSameDay: jest.fn((date1: Date, date2: Date) => date1.toDateString() === date2.toDateString()),
  eachDayOfInterval: jest.fn(({ start, end }: { start: Date; end: Date }) => {
    const days = [];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }),
  startOfWeek: jest.fn((date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day;
    newDate.setDate(diff);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }),
  endOfWeek: jest.fn((date: Date) => {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = 6 - day;
    newDate.setDate(newDate.getDate() + diff);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
  }),
}));

// Mock pour lucide-react
jest.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Bell: () => <div data-testid="bell-icon" />,
  Check: () => <div data-testid="check-icon" />,
  CheckCheck: () => <div data-testid="check-check-icon" />,
  Trash2: () => <div data-testid="trash2-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Download: () => <div data-testid="download-icon" />,
  BarChart3: () => <div data-testid="bar-chart3-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  RefreshCw: () => <div data-testid="refresh-cw-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  UserCheck: () => <div data-testid="user-check-icon" />,
  Building2: () => <div data-testid="building2-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  Save: () => <div data-testid="save-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  User: () => <div data-testid="user-icon" />,
  Palette: () => <div data-testid="palette-icon" />,
  Globe: () => <div data-testid="globe-icon" />,
  Database: () => <div data-testid="database-icon" />,
}));

// Mock pour localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock pour sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock pour window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock pour ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock pour IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppression des avertissements de console pendant les tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 