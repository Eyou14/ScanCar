"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function DashboardPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.push("/auth");
        return;
      }

      setUserEmail(user.email);

      // récupère les annonces de ce vendeur
      const { data: listingsData, error } = await supabase
        .from("listings")
        .select("id, marque, modele, prix")
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // pour chaque annonce, compte ses scans
      const listingsWithScans = await Promise.all(
        listingsData.map(async (listing) => {
          const { count } = await supabase
            .from("scans")
            .select("id", { count: "exact", head: true })
            .eq("listing_id", listing.id);

          return {
            ...listing,
            scan_count: count || 0,
          };
        })
      );

      setListings(listingsWithScans);
      setLoading(false);
    }

    loadData();
  }, [supabase, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4 text-center">Tableau de bord</h1>
        <p className="text-center text-gray-600 mb-6">
          Connecté en tant que <strong>{userEmail}</strong>
        </p>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white rounded py-2 mb-6"
        >
          Se déconnecter
        </button>

        <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
          Mes annonces
        </h2>

        {listings.length === 0 ? (
          <p className="text-center text-gray-500">
            Vous n’avez encore publié aucune annonce.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {listings.map((listing) => (
              <li key={listing.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {listing.marque} {listing.modele}
                    </p>
                    <p className="text-gray-500 text-sm">{listing.prix} €</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {listing.scan_count} scans
                    </p>
                    <a
                      href={`/voiture/${listing.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Voir l’annonce
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
