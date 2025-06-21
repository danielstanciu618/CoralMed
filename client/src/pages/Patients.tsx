import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PatientModal } from "@/components/PatientModal";
import { MedicalRecordModal } from "@/components/MedicalRecordModal";
import { FileViewer } from "@/components/FileViewer";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, Search, ChevronRight, Trash2, Edit, Plus, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Patient, MedicalRecord } from "@shared/schema";

export default function Patients() {
  const [searchName, setSearchName] = useState("");
  const [searchCondition, setSearchCondition] = useState("toate");
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; url: string } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allPatients = [], isLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: patientsByCondition = [] } = useQuery<Patient[]>({
    queryKey: [`/api/patients/condition/${searchCondition}`],
    enabled: searchCondition !== "toate",
  });

  // Filter patients based on search criteria (local filtering only)
  const filteredPatients = (() => {
    let result = allPatients;
    
    // Start with the right dataset based on condition filter
    if (searchCondition !== "toate") {
      result = patientsByCondition || [];
    }
    
    // Then filter by name if search term exists
    if (searchName.trim()) {
      const searchTerm = searchName.toLowerCase();
      result = result.filter((patient: Patient) => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return fullName.includes(searchTerm);
      });
    }
    
    return result;
  })();

  const { data: medicalRecords = [], isLoading: recordsLoading } = useQuery<MedicalRecord[]>({
    queryKey: [`/api/patients/${selectedPatient?.id}/records`],
    enabled: !!selectedPatient,
  });



  const deletePatientMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/patients/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Pacient șters",
        description: "Pacientul a fost șters cu succes.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setSelectedPatient(null);
    },
    onError: () => {
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge pacientul.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleDeletePatient = (patient: Patient) => {
    if (confirm(`Sigur doriți să ștergeți pacientul ${patient.firstName} ${patient.lastName}?`)) {
      deletePatientMutation.mutate(patient.id);
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowModal(true);
  };

  const handleNewPatient = () => {
    setEditingPatient(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPatient(null);
  };

  const handleNewRecord = () => {
    if (!selectedPatient) return;
    setEditingRecord(null);
    setShowRecordModal(true);
  };

  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord(record);
    setShowRecordModal(true);
  };

  const handleCloseRecordModal = () => {
    setShowRecordModal(false);
    setEditingRecord(null);
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleFileClick = (fileName: string) => {
    setSelectedFile({
      name: fileName,
      url: `/api/files/${encodeURIComponent(fileName)}`
    });
    setIsFileViewerOpen(true);
  };

  const deleteMedicalRecordMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/medical-records/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Dosar șters",
        description: "Dosarul medical a fost șters cu succes.",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/patients/${selectedPatient?.id}/records`] });
    },
    onError: () => {
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge dosarul medical.",
        variant: "destructive",
        duration: 4000,
      });
    },
  });

  const handleDeleteRecord = (record: MedicalRecord) => {
    if (confirm(`Sigur doriți să ștergeți dosarul medical pentru "${record.condition}"?`)) {
      deleteMedicalRecordMutation.mutate(record.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă pacienții...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dosare Medicale</h1>
            <p className="text-sm sm:text-base text-gray-600">Gestionează pacienții și istoricul medical</p>
          </div>
          <Button onClick={handleNewPatient} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            <UserPlus className="w-4 h-4 mr-2" />
            Pacient nou
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caută după nume
                </label>
                <Input
                  placeholder="Numele pacientului..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caută după boală
                </label>
                <Select value={searchCondition} onValueChange={setSearchCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toate bolile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="toate">Toate bolile</SelectItem>
                    <SelectItem value="carie">Carie</SelectItem>
                    <SelectItem value="detartaj">Detartaj</SelectItem>
                    <SelectItem value="tratament-canal">Tratament canal</SelectItem>
                    <SelectItem value="albire">Albire</SelectItem>
                    <SelectItem value="extractie">Extracție</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients List */}
          <Card>
            <CardHeader>
              <CardTitle>Lista pacienți ({filteredPatients.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredPatients.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handlePatientClick(patient)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {patient.phone} {patient.email && `• ${patient.email}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              Înregistrat: {new Date(patient.createdAt!).toLocaleDateString('ro-RO')}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  Nu există pacienți.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedPatient ? "Detalii pacient" : "Selectează un pacient"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                        {selectedPatient.firstName.charAt(0)}{selectedPatient.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </h3>
                        <p className="text-gray-600">
                          {selectedPatient.phone} {selectedPatient.email && `• ${selectedPatient.email}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPatient(selectedPatient)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePatient(selectedPatient)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Istoric Medical</h4>
                      <Button onClick={handleNewRecord} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Dosar nou
                      </Button>
                    </div>
                    {medicalRecords.length > 0 ? (
                      <div className="space-y-4">
                        {medicalRecords.map((record) => (
                          <div key={record.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium">{record.condition}</h5>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">
                                  {new Date(record.visitDate).toLocaleDateString('ro-RO')}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRecord(record)}
                                  title="Editează dosarul"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRecord(record)}
                                  title="Șterge dosarul"
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Tratament:</strong> {record.treatment}
                            </p>
                            {record.notes && (
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Observații:</strong> {record.notes}
                              </p>
                            )}
                            {record.files && record.files.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm text-gray-600">
                                    Radiografii atașate:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {record.files.map((fileName, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                      onClick={() => handleFileClick(fileName)}
                                    >
                                      <FileText className="w-4 h-4 mr-2" />
                                      {fileName}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Nu există înregistrări medicale.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Selectează un pacient din lista din stânga pentru a vedea detaliile.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PatientModal
        isOpen={showModal}
        onClose={handleCloseModal}
        patient={editingPatient}
      />

      {selectedPatient && (
        <MedicalRecordModal
          isOpen={showRecordModal}
          onClose={handleCloseRecordModal}
          patientId={selectedPatient.id}
          record={editingRecord}
        />
      )}

      {selectedFile && (
        <FileViewer
          isOpen={isFileViewerOpen}
          onClose={() => setIsFileViewerOpen(false)}
          fileName={selectedFile.name}
          fileUrl={selectedFile.url}
        />
      )}
    </div>
  );
}
