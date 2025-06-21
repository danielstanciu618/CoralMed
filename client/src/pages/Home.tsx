import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Clock, Star, ExternalLink, Shield, Zap, Heart, Scissors, Wrench, Activity } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  // Static reviews data - no database dependency
  const reviews = [
    {
      id: 1,
      name: "Maria Popescu",
      rating: 5,
      comment: "Servicii excelente! Dr. sunt foarte profesionali și clinica este foarte modernă. Recomand cu încredere!"
    },
    {
      id: 2,
      name: "Alexandru Ionescu", 
      rating: 5,
      comment: "Am fost foarte mulțumit de tratamentul primit. Personalul este foarte amabil și explicațiile sunt clare."
    },
    {
      id: 3,
      name: "Elena Radu",
      rating: 4,
      comment: "Experiență foarte bună! Tratamentul a fost fără durere și rezultatul final este fantastic."
    },
    {
      id: 4,
      name: "Mihai Georgescu",
      rating: 5,
      comment: "CoralMed este cea mai bună clinică dentară din București! Tehnologie modernă și doctori excelenți."
    },
    {
      id: 5,
      name: "Ana Stoica",
      rating: 5,
      comment: "Mulțumesc pentru profesionalismul dovedit! Mă simt mult mai încrezătoare cu noul meu zâmbet."
    },
    {
      id: 6,
      name: "Cristian Dumitrescu",
      rating: 4,
      comment: "Foarte mulțumit de serviciile primite. Programarea a fost ușoară și totul s-a desfășurat perfect."
    }
  ];

  const services = [
    {
      icon: <Activity className="w-8 h-8 text-blue-600" />,
      title: "Stomatologie Generală",
      description: "Consultații complete, obturații dentare, tratamente radiculare și îngrijire preventivă pentru menținerea sănătății orale."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Profilaxie Dentară",
      description: "Detartraj profesional, fluorurări și programe de prevenție pentru o igienă orală optimă."
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Albire Dentară",
      description: "Tratamente profesionale de albire pentru un zâmbet strălucitor și încrederea în sine sporită."
    },
    {
      icon: <Heart className="w-8 h-8 text-blue-600" />,
      title: "Parodontologie",
      description: "Tratarea bolilor gingivale și parodontale pentru menținerea sănătății gingiilor și a osului alveolar."
    },
    {
      icon: <Scissors className="w-8 h-8 text-blue-600" />,
      title: "Chirurgie Orală",
      description: "Extracții dentare, implantologie și diverse intervenții chirurgicale oro-maxilo-faciale."
    },
    {
      icon: <Wrench className="w-8 h-8 text-blue-600" />,
      title: "Protetica Dentară",
      description: "Coroane, punți dentare, proteze parțiale și complete pentru refacerea funcției masticatorii."
    }
  ];

  const openMaps = () => {
    const address = "Str. Sănătății Nr. 15, București";
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const callClinic = () => {
    window.location.href = "tel:+40721234567";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            CoralMed - Îngrijire Dentară de Calitate
          </h1>
          <p className="mt-6 text-xl max-w-3xl">
            Oferim servicii dentare complete cu tehnologie modernă și o echipă de specialiști dedicați sănătății dumneavoastră orale.
          </p>
          <div className="mt-10">
            <Link href="/contact">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg">
                Contactează-ne
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Clinic Info Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Adresa</h3>
              <p className="text-gray-600 mb-2">Str. Sănătății Nr. 15, București</p>
              <Button onClick={openMaps} variant="ghost" className="text-blue-600 hover:text-blue-700">
                <ExternalLink className="w-4 h-4 mr-1" />
                Deschide în Maps
              </Button>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Telefon</h3>
              <p className="text-gray-600 mb-2">+40 721 234 567</p>
              <Button onClick={callClinic} variant="ghost" className="text-blue-600 hover:text-blue-700">
                <Phone className="w-4 h-4 mr-1" />
                Sună acum
              </Button>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Program</h3>
              <p className="text-gray-600 text-sm">
                Lun-Vin: 08:00 - 20:00<br />
                Sâmbătă: 09:00 - 16:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Serviciile Noastre</h2>
          <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Oferim o gamă completă de servicii dentare cu tehnologie de ultimă generație și o echipă de specialiști experimentați.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/contact">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Programează o Consultație
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">Recenzii Pacienți</h2>
          <p className="text-gray-600 text-center mb-12">
            Citește experiențele pacienților noștri mulțumiți
          </p>
          
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <CardContent className="p-0">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-semibold">{review.name}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">"{review.comment}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nu există recenzii disponibile momentan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
