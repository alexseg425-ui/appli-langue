// Adresse inconnue (ex. un lien web avec un chemin qui n'existe pas) : on renvoie à l'accueil.
import { Redirect } from 'expo-router';

export default function NotFound() {
  return <Redirect href="/" />;
}
