import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { AppointmentModal } from "@/components/AppointmentModal";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Appointment } from "@shared/schema";

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Current month
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const { data: monthAppointments = [] } = useQuery<Appointment[]>({
    queryKey: [`/api/appointments/month/${currentMonth.getFullYear()}/${currentMonth.getMonth() + 1}`],
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Programare ștearsă",
        description: "Programarea a fost ștearsă cu succes.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      // Invalidate all month queries to update calendar highlighting immediately
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/appointments/month');
        }
      });
    },
    onError: () => {
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge programarea.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAppointment = (appointment: Appointment) => {
    if (confirm(`Sigur doriți să ștergeți programarea pentru ${appointment.firstName} ${appointment.lastName}?`)) {
      deleteAppointmentMutation.mutate(appointment.id);
    }
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };

  const handleNewAppointment = () => {
    // Use current selected date or today's date
    const dateToCheck = selectedDate || new Date();
    const dayOfWeek = dateToCheck.getDay();
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast({
        title: "Weekend nedisponibil",
        description: "Nu se pot programa consultații în zilele de weekend. Selectați o zi lucrătoare.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    
    setEditingAppointment(null);
    setShowModal(true);
  };

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
    
    setEditingAppointment(null);
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
  };

  // Get appointment dates for calendar highlighting
  const appointmentDates = monthAppointments.map(apt => {
    // Parse the UTC date and convert to local date
    const utcDate = new Date(apt.appointmentDate);
    // Create local date without timezone offset issues
    return new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
  });

  // Filter appointments for selected date
  const selectedDateAppointments = appointments.filter((apt: Appointment) => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter((apt: Appointment) => new Date(apt.appointmentDate) >= new Date())
    .sort((a: Appointment, b: Appointment) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Programări</h1>
            <p className="text-sm sm:text-base text-gray-600">Gestionează programările pacienților</p>
          </div>
          <Button onClick={handleNewAppointment} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Programare nouă
          </Button>
        </div>

        {/* Calendar View */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {currentMonth.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="w-fit">
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

              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="rounded-md border calendar-weekend-right"
              weekStartsOn={1}
              modifiers={{
                hasAppointment: appointmentDates,
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
              disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
              />
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: '#93c5fd' }}></div>
                  <span>Zilele cu programări</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-white border border-gray-300 rounded mr-2"></div>
                  <span>Zile disponibile</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Programări pentru {selectedDate.toLocaleDateString('ro-RO', { 
                weekday: 'long',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedDateAppointments.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {selectedDateAppointments.map((appointment: Appointment) => (
                  <div key={appointment.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {appointment.firstName.charAt(0)}{appointment.lastName.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <Link href={`/patients/${appointment.patientId}`}>
                            <h4 className="text-lg font-medium text-gray-900 hover:text-blue-600 cursor-pointer">
                              {appointment.firstName} {appointment.lastName}
                            </h4>
                          </Link>
                          <p className="text-sm text-gray-600">
                            {appointment.phone} {appointment.email && `• ${appointment.email}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.appointmentDate).toLocaleDateString('ro-RO')} • {appointment.purpose}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-1">Observații: {appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAppointment(appointment)}
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAppointment(appointment)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <Clock className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nu există programări în această zi
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Selectați o altă dată din calendar sau adăugați o programare nouă.
                  </p>
                  <Button 
                    onClick={() => handleNewAppointmentForDate(selectedDate)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adaugă programare
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AppointmentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        appointment={editingAppointment}
        selectedDate={selectedDate}
      />
    </div>
  );
}
