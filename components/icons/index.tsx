'use client';

// Icon mapping from MUI Icons to Lucide React
// This provides backward compatibility for existing MUI icon usage

import {
  Menu,
  X,
  Settings,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Share,
  Copy,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Heart,
  Home,
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Power,
  Sun,
  Moon,
} from 'lucide-react';

// MUI Icon name to Lucide icon mapping
export const iconMap = {
  // Navigation
  Menu,
  Close: X,
  Settings,
  MoreVert: MoreVertical,
  MoreVertical,
  
  // Arrows
  KeyboardArrowDown: ChevronDown,
  KeyboardArrowUp: ChevronUp,
  KeyboardArrowLeft: ChevronLeft,
  KeyboardArrowRight: ChevronRight,
  ExpandMore: ChevronDown,
  ExpandLess: ChevronUp,
  
  // Actions
  Search,
  Add: Plus,
  Remove: Minus,
  Edit,
  Delete: Trash2,
  Save,
  Download,
  Upload,
  Share,
  ContentCopy: Copy,
  Check,
  Clear: X,
  
  // Status
  Error: AlertCircle,
  Warning: AlertCircle,
  Info,
  Help: HelpCircle,
  
  // Social
  Star,
  Favorite: Heart,
  
  // Common
  Home,
  Person: User,
  People: Users,
  Email: Mail,
  Phone,
  Event: Calendar,
  Schedule: Clock,
  Visibility: Eye,
  VisibilityOff: EyeOff,
  Lock,
  LockOpen: Unlock,
  
  // Commerce
  ShoppingCart,
  Payment: CreditCard,
  AttachMoney: DollarSign,
  
  // Utility
  FilterList: Filter,
  Sort: ArrowUpDown,
  SortByAlpha: ArrowUpDown,
  Refresh: RefreshCw,
  PowerSettingsNew: Power,
  
  // Theme
  LightMode: Sun,
  DarkMode: Moon,
};

// Helper function to get icon by name
export function getIcon(iconName: string) {
  return iconMap[iconName as keyof typeof iconMap];
}

// Backward compatibility exports using MUI names
export const MenuIcon = Menu;
export const CloseIcon = X;
export const SettingsIcon = Settings;
export const MoreVertIcon = MoreVertical;
export const SearchIcon = Search;
export const AddIcon = Plus;
export const EditIcon = Edit;
export const DeleteIcon = Trash2;
export const SaveIcon = Save;
export const DownloadIcon = Download;
export const UploadIcon = Upload;
export const ShareIcon = Share;
export const CheckIcon = Check;
export const ClearIcon = X;
export const ErrorIcon = AlertCircle;
export const WarningIcon = AlertCircle;
export const InfoIcon = Info;
export const HelpIcon = HelpCircle;
export const StarIcon = Star;
export const FavoriteIcon = Heart;
export const HomeIcon = Home;
export const PersonIcon = User;
export const PeopleIcon = Users;
export const EmailIcon = Mail;
export const PhoneIcon = Phone;
export const EventIcon = Calendar;
export const ScheduleIcon = Clock;
export const VisibilityIcon = Eye;
export const VisibilityOffIcon = EyeOff;
export const LockIcon = Lock;
export const LockOpenIcon = Unlock;
export const ShoppingCartIcon = ShoppingCart;
export const PaymentIcon = CreditCard;
export const AttachMoneyIcon = DollarSign;
export const FilterListIcon = Filter;
export const SortIcon = ArrowUpDown;
export const RefreshIcon = RefreshCw;
export const PowerSettingsNewIcon = Power;
export const LightModeIcon = Sun;
export const DarkModeIcon = Moon;

// Common icon sets for easy import
export const NavigationIcons = {
  Menu,
  Close: X,
  Settings,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
};

export const ActionIcons = {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Share,
  Copy,
  Check,
  X,
};

export const StatusIcons = {
  AlertCircle,
  Info,
  HelpCircle,
  Star,
  Heart,
};

export const UserIcons = {
  Home,
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Lock,
  Unlock,
};

export const CommerceIcons = {
  ShoppingCart,
  CreditCard,
  DollarSign,
};

export const ThemeIcons = {
  Sun,
  Moon,
};
