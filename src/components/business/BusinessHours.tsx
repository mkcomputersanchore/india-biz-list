import { Clock } from 'lucide-react';

interface BusinessHour {
  id: string;
  day_of_week: number;
  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;
  break_start: string | null;
  break_end: string | null;
}

interface BusinessHoursProps {
  hours: BusinessHour[];
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(time: string | null): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function BusinessHours({ hours }: BusinessHoursProps) {
  const today = new Date().getDay();

  const sortedHours = [...hours].sort((a, b) => a.day_of_week - b.day_of_week);

  if (sortedHours.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        Business Hours
      </h3>
      <div className="space-y-2">
        {sortedHours.map((hour) => (
          <div
            key={hour.id}
            className={`flex justify-between items-center py-2 px-3 rounded-lg text-sm ${
              hour.day_of_week === today
                ? 'bg-primary/10 font-semibold'
                : ''
            }`}
          >
            <span className="text-foreground font-medium">{DAYS[hour.day_of_week]}</span>
            <span className="text-muted-foreground">
              {hour.is_closed ? (
                <span className="text-destructive font-medium">Closed</span>
              ) : (
                <span>
                  {formatTime(hour.open_time)} - {formatTime(hour.close_time)}
                  {hour.break_start && hour.break_end && (
                    <span className="block text-xs text-muted-foreground">
                      Break: {formatTime(hour.break_start)} - {formatTime(hour.break_end)}
                    </span>
                  )}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
