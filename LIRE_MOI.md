# RSM Scouting — site statique (généré le 2026-11-11)

Mettre en ligne : envoyer **tout le contenu** de ce dossier (ou le zip `RSM_SCOUTING/rsm_scouting_site.zip` décompressé) à la racine de l'hébergement du site RSM Scouting. Aucun serveur, aucune base : HTML + CSS + JS.
Aperçu local : `python -m http.server 8767` depuis ce dossier, puis http://127.0.0.1:8767/

Liens vers le site RSM Agency (Match Tracker, matchs complets, fiches des joueurs gérés) : adresse définie dans `assets/js/config.js` (`window.RSM_AGENCY_BASE`, par défaut https://rsmagency.fr/).
Régénérer après une mise à jour des données (depuis la racine du projet) :
  python RSM_SCOUTING/outils/build_data_pack.py     # feuilles de match, effectifs, classements
  python RSM_SCOUTING/outils/construire_fiches.py   # fiches S7 (jointures vidéo)
  python RSM_SCOUTING/outils/enrichir_web.py        # photos / sélections (reprend où il s'est arrêté)
  python RSM_SCOUTING/outils/generer_site_pro.py    # ce site + le zip

561 joueurs · 63 matchs · 87 photos. Les compléments web (photo, taille, pied, sélections) ne sont gardés que si l'identité est confirmée par au moins deux signaux ; la source est citée sur la fiche.
