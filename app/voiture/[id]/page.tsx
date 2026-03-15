"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function PublicListing() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const params = useParams();
  const { id } = params;
  const [listing, setListing] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchListing() {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (error) setError(error.message);
      else setListing(data);
    }

    async function recordScan() {
      // convertit l'id en entier pour éviter l'erreur bigint
      const listingId = parseInt(id as string, 10);
      if (Number.isNaN(listingId)) return;
      await supabase.from("scans").insert([
        { listing_id: listingId, timestamp: new Date().toISOString() },
      ]);
    }

    if (id) {
      fetchListing();
      recordScan();
    }
  }, [id, supabase]);

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Erreur : {error}
      </div>
    );

  if (!listing)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Chargement...
      </div>
    );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2 text-center">
          {listing.marque} {listing.modele}
        </h1>

        <p className="text-center text-gray-600 mb-4">
          {listing.annee} • {listing.kilometrage} km
        </p>

        <p className="text-center text-blue-600 font-semibold text-xl mb-2">
          {listing.prix} €
        </p>

        <p className="text-sm text-gray-700 mb-4">{listing.description}</p>

        <div className="text-sm text-gray-600 mb-2">
          <strong>Carburant :</strong> {listing.carburant}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          <strong>Transmission :</strong> {listing.transmission}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          <strong>Localisation :</strong> {listing.localisation}
        </div>

        <hr className="my-4" />

        <div className="text-center mt-4 space-y-2">
          <button
            onClick={() => {
              window.location.href = `tel:${listing.telephone}`;
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded py-2"
          >
            Appeler le vendeur
          </button>

          <button
            onClick={() => {
              const subject = encodeURIComponent(
                `Intéressé par votre ${listing.marque} ${listing.modele}`
              );
              window.location.href = `mailto:${listing.email}?subject=${subject}`;
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded py-2"
          >
            Envoyer un e‑mail
          </button>
        </div>
      </div>
    </div>
  );
}
