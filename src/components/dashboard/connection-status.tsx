import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Phone, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface ConnectionStatusProps {
  calendarEmail: string | null;
  lastSynced: Date | null;
  phoneNumber: string | null;
  isActive: boolean;
  reminderMinutes: number;
}

export function ConnectionStatus({
  calendarEmail,
  lastSynced,
  phoneNumber,
  isActive,
  reminderMinutes,
}: ConnectionStatusProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Connection Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calendar */}
        <div className="flex items-start gap-3">
          <div className="bg-blue-50 rounded-lg p-2 mt-0.5">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Google Calendar</p>
              {calendarEmail ? (
                <Badge variant="success" className="text-xs">Connected</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">Disconnected</Badge>
              )}
            </div>
            {calendarEmail && (
              <p className="text-xs text-muted-foreground truncate">{calendarEmail}</p>
            )}
            {lastSynced && (
              <p className="text-xs text-muted-foreground">
                Last synced: {formatDateTime(lastSynced)}
              </p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <div className="bg-green-50 rounded-lg p-2 mt-0.5">
            <Phone className="h-4 w-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Phone Number</p>
              {phoneNumber ? (
                <Badge variant="success" className="text-xs">Set</Badge>
              ) : (
                <Badge variant="warning" className="text-xs">Not set</Badge>
              )}
            </div>
            {phoneNumber ? (
              <p className="text-xs text-muted-foreground">{phoneNumber}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Configure in settings</p>
            )}
          </div>
        </div>

        {/* Reminder timing */}
        <div className="flex items-start gap-3">
          <div className="bg-purple-50 rounded-lg p-2 mt-0.5">
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Reminder Timing</p>
            <p className="text-xs text-muted-foreground">{reminderMinutes} minutes before meetings</p>
          </div>
        </div>

        {/* Active status */}
        <div className="flex items-center gap-3 pt-1 border-t">
          {isActive ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-slate-400" />
          )}
          <span className="text-sm font-medium">
            Reminders {isActive ? "active" : "paused"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
