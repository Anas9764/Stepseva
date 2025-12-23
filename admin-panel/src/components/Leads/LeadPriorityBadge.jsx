import { AlertCircle, TrendingUp, Minus, ArrowDown } from 'lucide-react';

const LeadPriorityBadge = ({ priority }) => {
  const priorityConfig = {
    urgent: {
      color: 'red',
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Urgent',
      icon: AlertCircle,
    },
    high: {
      color: 'orange',
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      label: 'High',
      icon: TrendingUp,
    },
    medium: {
      color: 'yellow',
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Medium',
      icon: Minus,
    },
    low: {
      color: 'green',
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Low',
      icon: ArrowDown,
    },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

export default LeadPriorityBadge;

