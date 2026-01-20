import type { Activity, ActivityInfo } from '../types';

interface ActivitySelectorProps {
  selectedActivity: Activity | null;
  onSelect: (activity: Activity) => void;
  disabled?: boolean;
}

const activities: ActivityInfo[] = [
  { id: 'running', name: 'Running', icon: '🏃', intensity: 'high' },
  { id: 'cycling', name: 'Cycling', icon: '🚴', intensity: 'high' },
  { id: 'skiing', name: 'Skiing', icon: '⛷️', intensity: 'medium' },
  { id: 'hiking', name: 'Hiking', icon: '🥾', intensity: 'medium' },
  { id: 'walking', name: 'Walking', icon: '🚶', intensity: 'low' },
];

export function ActivitySelector({ selectedActivity, onSelect, disabled }: ActivitySelectorProps) {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-slate-800 mb-3">Choose your activity</h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onSelect(activity.id)}
            disabled={disabled}
            className={`
              flex flex-col items-center justify-center p-3 rounded-xl transition-all
              ${selectedActivity === activity.id
                ? 'bg-blue-500 text-white shadow-lg scale-105'
                : 'bg-white text-slate-700 shadow hover:shadow-md hover:scale-102'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-pressed={selectedActivity === activity.id}
          >
            <span className="text-2xl mb-1" role="img" aria-label={activity.name}>
              {activity.icon}
            </span>
            <span className="text-xs font-medium">{activity.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
