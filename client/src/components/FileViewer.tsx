import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Download, X } from "lucide-react";

interface FileViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
}

export function FileViewer({ isOpen, onClose, fileName, fileUrl }: FileViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Determine file type
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const fileExtension = getFileExtension(fileName);
  const isPDF = fileExtension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExtension);

  const handleZoomIn = () => {
    if (!isPDF) setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    if (!isPDF) setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    if (!isPDF) setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetView = () => {
    setScale(1);
    setRotation(0);
  };

  const handleClose = () => {
    resetView();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 [&>button]:!hidden">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Radiografie: {fileName}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {!isPDF && (
                <>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRotate}>
                    <RotateCw className="w-4 h-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4 bg-gray-50" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <div className="flex justify-center items-start py-8">
            {isPDF ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Document PDF: {fileName}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Din motive de securitate, PDF-urile se deschid într-o fereastră nouă.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => window.open(fileUrl, '_blank')} 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Deschide PDF în fereastră nouă
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDownload}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descarcă PDF
                    </Button>
                  </div>
                </div>
              </div>
            ) : isImage ? (
              <div 
                className="bg-gray-900 shadow-lg p-4 rounded-lg"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-in-out'
                }}
              >
                <img
                  src={fileUrl}
                  alt={`Radiografie: ${fileName}`}
                  className="max-w-full object-contain border border-gray-600"
                  style={{ 
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '80vw',
                    maxHeight: '70vh'
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white rounded-lg p-8 shadow-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Fișier nedisplay: {fileName}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Acest tip de fișier nu poate fi vizualizat direct în browser.
                  </p>
                  <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Descarcă fișierul
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile touch controls */}
        <div className="md:hidden p-4 bg-white border-t">
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="lg" onClick={handleZoomOut}>
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={handleZoomIn}>
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={handleRotate}>
              <RotateCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}