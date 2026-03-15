"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { QRCodeSVG } from "qrcode.react";

export default function CreateListing() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const [formData, setFormData] = useState({
    marque: "",
    modele: "",
    annee: "",
    kilometrage: "",
    carburant: "",
    transmission: "",
    prix: "",
    localisation: "",
    description: "",
    telephone: "",
    email: "",
  });
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("Publication en cours...");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setMessage("Veuillez vous connecter avant de créer une annonce.");
      router.push("/auth");
      return;
    }

    const { data, error } = await supabase.from("listings").insert([
      {
        user_id: user.id,
        marque: formData.marque,
        modele: formData.modele,
        annee: formData.annee,
        kilometrage: formData.kilometrage,
        carburant: formData.carburant,
        transmission: formData.transmission,
        prix: formData.prix,
        localisation: formData.localisation,
        description: formData.description,
        telephone: formData.telephone,
        email: formData.email,
      },
    ]).select();

    if (error) {
      setMessage("Erreur : " + error.message);
      return;
    }

    const listingId = data?.[0]?.id;
    const listingUrl = `http://localhost:3000/voiture/${listingId}`;

    // Génération du QR Code
    setQrUrl(listingUrl);

    setMessage("Annonce publiée avec succès !");
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Créer une annonce</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
          {Object.keys(formData).map((field) => (
            <div key={field} className="flex flex-col">
              <label className="capitalize font-medium mb-1">{field}</label>
              {field !== "description" ? (
                <input
                  type="text"
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                  required
                />
              ) : (
                <textarea
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  className="border rounded px-3 py-2"
                  rows={3}
                  required
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded py-2 mt-4"
          >
            Publier l’annonce
          </button>
        </form>

        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}

        {qrUrl && (
  <div className="mt-6 flex flex-col items-center">
    <p className="mb-2 text-sm text-gray-600">QR Code de ton annonce :</p>
    <QRCodeSVG value={qrUrl} size={160} />
  </div>
)}
      </div>
    </div>
  );
}
