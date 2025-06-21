import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Users, Mail, Clock, Plus, UserPlus, MailOpen } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Link } from "wouter";
import { Appointment } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  todayAppointments: number;
  totalPatients: number;
  unreadMessages: number;
  upcomingAppointments: number;
}

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: selectedDateAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments", { date: selectedDate.toISOString().split('T')[0] }],
  });

  const { data: monthAppointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/month", selectedDate.getFullYear(), selectedDate.getMonth() + 1],
  });

  const handleNewAppointmentForDate = (date: Date) => {
    // Check if it's weekend (Saturday = 6, Sunday = 0)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast({
        title: "Weekend nedisponibil",
        description: "Nu se pot programa consultații în zilele de weekend.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Acasă</h1>
          <p className="text-sm sm:text-base text-gray-600">Bun venit în sistemul de management al clinicii</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/appointments">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 rounded-full p-3">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Programări astăzi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.todayAppointments || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patients">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 rounded-full p-3">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total pacienți</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalPatients || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/messages">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 rounded-full p-3">
                    <Mail className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Mesaje noi</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.unreadMessages || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/appointments">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="bg-red-100 rounded-full p-3">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Programări viitoare</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.upcomingAppointments || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Calendar and Selected Date Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    // Check if it's weekend (Saturday = 6, Sunday = 0)
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    
                    // Allow selection of all weekdays, regardless of appointments
                    if (!isWeekend) {
                      setSelectedDate(date);
                    }
                  }
                }}

                className="rounded-md border calendar-weekend-right"
                weekStartsOn={1}
                disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
                modifiers={{
                  hasAppointment: monthAppointments.map(apt => new Date(apt.appointmentDate)),
                  weekend: (date) => date.getDay() === 0 || date.getDay() === 6,
                  weekday: (date) => date.getDay() !== 0 && date.getDay() !== 6,
                }}
                modifiersStyles={{
                  hasAppointment: {
                    backgroundColor: '#93c5fd',
                    color: '#1e40af',
                    fontWeight: 'bold',
                    borderRadius: '0.375rem',
                  },
                  weekend: {
                    backgroundColor: '#f3f4f6',
                    color: '#9ca3af',
                    cursor: 'not-allowed',
                  },
                  weekday: {
                    cursor: 'pointer',
                    borderRadius: '0.375rem',
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Programări pentru {selectedDate.toLocaleDateString('ro-RO', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <Button
                  onClick={() => handleNewAppointmentForDate(selectedDate)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă programare
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedDateAppointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAppointments.map((appointment: Appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-lg">{appointment.firstName} {appointment.lastName}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.appointmentDate).toLocaleTimeString('ro-RO', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {appointment.purpose}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nu există programări în această zi.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acțiuni rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/appointments">
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <Plus className="w-5 h-5 mr-3 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Adaugă programare</div>
                    <div className="text-sm text-gray-500">Programează un pacient</div>
                  </div>
                </Button>
              </Link>
              <Link href="/patients">
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <UserPlus className="w-5 h-5 mr-3 text-green-600" />
                  <div className="text-left">
                    <div className="font-medium">Adaugă pacient</div>
                    <div className="text-sm text-gray-500">Creează dosar medical nou</div>
                  </div>
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <MailOpen className="w-5 h-5 mr-3 text-orange-600" />
                  <div className="text-left">
                    <div className="font-medium">Vezi mesaje</div>
                    <div className="text-sm text-gray-500">Răspunde la întrebări</div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <AppointmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
      />
    </div>
  );
}
